'use server';

import { prisma } from '@/lib/prisma';
import { SHOPIFY_API_VERSION } from '@/lib/constants/shopify';
import { PlanType, type PlanTypeValue } from '@/lib/constants/plan';
import { createSubscription } from '@/lib/shopify/billing';

export interface PlanInfo {
  planType: PlanTypeValue;
  orderCount: number;
  orderLimit: number;
  isUnlimited: boolean;
  paidTierPrice: number;
  paidTierPriceMonthly: number;
  paidTierPriceYearly: number;
  planExpiresAt: Date | null;
  isExpired: boolean;
}

const FREE_TIER_LIMIT = parseInt(process.env.FREE_TIER_LIMIT || '50');
const PAID_TIER_PRICE_MONTHLY = parseFloat(process.env.PAID_TIER_PRICE_MONTHLY || '19');
const PAID_TIER_PRICE_YEARLY = parseFloat(process.env.PAID_TIER_PRICE_YEARLY || '190');

/**
 * Get monthly order count from Shopify API for orders tagged with LEADCOD
 */
export async function getMonthlyOrderCount(shopUrl: string): Promise<{ count: number; error?: string }> {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      select: { accessToken: true }
    });

    if (!shop || !shop.accessToken) {
      return { count: 0, error: 'Shop not found or access token not available' };
    }

    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthISO = startOfMonth.toISOString();

    // Shopify API endpoint to count orders
    const baseUrl = `https://${shopUrl}/admin/api/${SHOPIFY_API_VERSION}`;
    
    // Fetch orders with LEADCOD tag created this month
    // The tag filter might not work on count endpoint, so we'll fetch and count
    const ordersUrl = `${baseUrl}/orders.json?status=any&created_at_min=${startOfMonthISO}&limit=250&fields=id,tags`;
    
    let totalCount = 0;
    let hasMore = true;
    let pageInfo = '';

    while (hasMore) {
      const url = pageInfo 
        ? `${ordersUrl}&page_info=${pageInfo}`
        : ordersUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If we got some results before error, return what we have
        if (totalCount > 0) {
          break;
        }
        return { count: 0, error: `Failed to fetch orders: ${response.status}` };
      }

      const data = await response.json();
      const orders = data.orders || [];
      
      // Filter orders that have LEADCOD tag
      const leadcodOrders = orders.filter((order: any) => 
        order.tags && order.tags.includes('LEADCOD')
      );
      
      totalCount += leadcodOrders.length;

      // Check for pagination
      const linkHeader = response.headers.get('link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<[^>]+page_info=([^&>]+)/);
        pageInfo = nextMatch ? nextMatch[1] : '';
        hasMore = !!pageInfo && orders.length === 250;
      } else {
        hasMore = false;
      }
    }

    return { count: totalCount };
  } catch (error) {
    return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get plan information for a shop
 */
export async function getPlanInfo(shopUrl: string): Promise<PlanInfo> {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      select: { id: true, plan: true }
    });

    if (!shop) {
      return {
        planType: PlanType.FREE,
        orderCount: 0,
        orderLimit: FREE_TIER_LIMIT,
        isUnlimited: false,
        paidTierPrice: PAID_TIER_PRICE_MONTHLY,
        paidTierPriceMonthly: PAID_TIER_PRICE_MONTHLY,
        paidTierPriceYearly: PAID_TIER_PRICE_YEARLY,
        planExpiresAt: null,
        isExpired: false
      };
    }

    // Get active subscription (if any)
    const activeSubscription = await prisma.subscription.findFirst({
      where: { 
        shopId: shop.id,
        status: {
          in: ['active', 'ACTIVE', 'ACCEPTED']
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    // Get monthly order count
    const { count } = await getMonthlyOrderCount(shopUrl);

    // Determine plan type and expiration
    // If no subscription exists, user is on free trial by default
    let planType = PlanType.FREE;
    let planExpiresAt: Date | null = null;
    let isExpired = false;

    if (activeSubscription) {
      // Check if subscription is expired
      const now = new Date();
      if (activeSubscription.expiresAt) {
        isExpired = activeSubscription.expiresAt < now;
        planExpiresAt = activeSubscription.expiresAt;
      } else {
        // Recurring subscription (no expiration)
        isExpired = false;
        planExpiresAt = null;
      }

      // If subscription is active and not expired, user has paid plan
      if (!isExpired && (activeSubscription.status === 'active' || activeSubscription.status === 'ACTIVE' || activeSubscription.status === 'ACCEPTED')) {
        planType = PlanType.PAID;
      } else {
        // Subscription expired or cancelled, downgrade to free
        planType = PlanType.FREE;
        if (isExpired) {
          // Update subscription status to expired
          await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: { status: 'expired' }
          });
          // Update shop plan
          await prisma.shop.update({
            where: { id: shop.id },
            data: { plan: PlanType.FREE }
          });
        }
      }
    } else {
      // No subscription = free trial by default
      planType = PlanType.FREE;
      // Update shop plan if it's set to paid but no subscription exists
      if (shop.plan === PlanType.PAID) {
        await prisma.shop.update({
          where: { id: shop.id },
          data: { plan: PlanType.FREE }
        });
      }
    }

    return {
      planType,
      orderCount: count,
      orderLimit: FREE_TIER_LIMIT,
      isUnlimited: planType === PlanType.PAID && !isExpired,
      paidTierPrice: PAID_TIER_PRICE_MONTHLY,
      paidTierPriceMonthly: PAID_TIER_PRICE_MONTHLY,
      paidTierPriceYearly: PAID_TIER_PRICE_YEARLY,
      planExpiresAt,
      isExpired
    };
  } catch (error) {
    return {
      planType: PlanType.FREE,
      orderCount: 0,
      orderLimit: FREE_TIER_LIMIT,
      isUnlimited: false,
      paidTierPrice: PAID_TIER_PRICE_MONTHLY,
      paidTierPriceMonthly: PAID_TIER_PRICE_MONTHLY,
      paidTierPriceYearly: PAID_TIER_PRICE_YEARLY,
      planExpiresAt: null,
      isExpired: false
    };
  }
}

/**
 * Set plan for a shop
 */
export async function setPlan(
  shopUrl: string, 
  planType: PlanTypeValue,
  billingCycle?: 'monthly' | 'yearly'
): Promise<{ success: boolean; error?: string; confirmationUrl?: string }> {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      select: { id: true }
    });

    if (!shop) {
      return {
        success: false,
        error: 'Shop not found'
      };
    }

    // If subscribing to paid plan, trigger Shopify billing
    if (planType === PlanType.PAID && billingCycle) {
      const price = billingCycle === 'monthly' ? PAID_TIER_PRICE_MONTHLY : PAID_TIER_PRICE_YEARLY;
      const confirmationUrl = await createSubscription(shopUrl, price, billingCycle);
      
      return {
        success: true,
        confirmationUrl
      };
    }

    // For free plan, just update the shop plan
    // No need to create subscription records for free plans
    await prisma.shop.update({
      where: { id: shop.id },
      data: { 
        plan: planType,
      }
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
