'use server';

import { prisma } from '@/lib/prisma';
import { SHOPIFY_API_VERSION } from '@/lib/constants/shopify';

export interface PlanInfo {
  planType: 'free' | 'paid';
  orderCount: number;
  orderLimit: number;
  isUnlimited: boolean;
  paidTierPrice: number;
}

const FREE_TIER_LIMIT = parseInt(process.env.FREE_TIER_LIMIT || '7');
const PAID_TIER_PRICE = parseFloat(process.env.PAID_TIER_PRICE || '19');

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
        console.error('Failed to fetch orders:', errorText);
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
    console.error('Error getting monthly order count:', error);
    return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get plan information for a shop
 */
export async function getPlanInfo(shopUrl: string): Promise<PlanInfo> {
  try {
    // For now, we'll assume all shops start on free tier
    // In the future, you can add a subscription field to the Shop model
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      select: { id: true }
    });

    if (!shop) {
      return {
        planType: 'free',
        orderCount: 0,
        orderLimit: FREE_TIER_LIMIT,
        isUnlimited: false,
        paidTierPrice: PAID_TIER_PRICE
      };
    }

    // Get monthly order count
    const { count } = await getMonthlyOrderCount(shopUrl);

    // Check if shop has paid subscription (you can add this to Shop model later)
    // For now, we'll check if order count exceeds free tier limit
    const planType = count >= FREE_TIER_LIMIT ? 'free' : 'free'; // Always free for now, can be updated when subscription is added

    return {
      planType,
      orderCount: count,
      orderLimit: FREE_TIER_LIMIT,
      isUnlimited: planType === 'paid',
      paidTierPrice: PAID_TIER_PRICE
    };
  } catch (error) {
    console.error('Error getting plan info:', error);
    return {
      planType: 'free',
      orderCount: 0,
      orderLimit: FREE_TIER_LIMIT,
      isUnlimited: false,
      paidTierPrice: PAID_TIER_PRICE
    };
  }
}
