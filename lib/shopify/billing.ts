import { prisma } from '@/lib/prisma';
import { SHOPIFY_API_VERSION, getApplicationUrl } from '@/lib/constants/shopify';
import { PlanType } from '@/lib/constants/plan';

export type BillingCycle = 'monthly' | 'yearly';

interface ShopifySubscription {
  id: string;
  name: string;
  status: string;
  currentPeriodEnd?: string;
  lineItems?: Array<{
    plan?: {
      __typename?: string;
      interval?: string;
      pricingDetails?: {
        interval?: string;
      };
      price?: {
        amount: number;
        currencyCode: string;
      };
    };
  }>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Get shop with access token
 */
async function getShopWithToken(shopUrl: string): Promise<{ id: string; accessToken: string }> {
  const shop = await prisma.shop.findFirst({
    where: { url: shopUrl },
    select: { id: true, accessToken: true }
  });

  if (!shop || !shop.accessToken) {
    throw new Error('Shop not found or access token not available');
  }

  return { id: shop.id, accessToken: shop.accessToken };
}

/**
 * Get GraphQL endpoint URL for a shop
 */
function getGraphQLUrl(shopUrl: string): string {
  return `https://${shopUrl}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

/**
 * Execute GraphQL query/mutation
 */
async function executeGraphQL<T>(
  shopUrl: string,
  accessToken: string,
  query: string,
  variables?: Record<string, any>
): Promise<GraphQLResponse<T>> {
  const response = await fetch(getGraphQLUrl(shopUrl), {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * GraphQL Queries and Mutations
 */
const QUERIES = {
  GET_SUBSCRIPTION: `
    query appSubscription($id: ID!) {
      appSubscription(id: $id) {
        id
        name
        status
        currentPeriodEnd
        lineItems {
          plan {
            __typename
            ... on AppRecurringPricing {
              interval
              price {
                amount
                currencyCode
              }
            }
            ... on AppPlanV2 {
              pricingDetails {
                ... on AppRecurringPricing {
                  interval
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  LIST_ACTIVE_SUBSCRIPTIONS: `
    query {
      appInstallation {
        activeSubscriptions {
          id
          name
          status
          currentPeriodEnd
          lineItems {
            plan {
              __typename
              ... on AppRecurringPricing {
                interval
              }
              ... on AppPlanV2 {
                pricingDetails {
                  ... on AppRecurringPricing {
                    interval
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  CREATE_SUBSCRIPTION: `
    mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        returnUrl: $returnUrl
        test: $test
      ) {
        appSubscription {
          id
          name
          status
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `,
};

/**
 * Convert Shopify interval to billing cycle
 */
function intervalToBillingCycle(interval?: string): BillingCycle {
  return interval === 'EVERY_30_DAYS' ? 'monthly' : 'yearly';
}

/**
 * Calculate expiration date from subscription or billing cycle
 */
function calculateExpirationDate(
  subscription?: ShopifySubscription,
  billingCycle?: BillingCycle
): Date {
  if (subscription?.currentPeriodEnd) {
    return new Date(subscription.currentPeriodEnd);
  }

  const now = new Date();
  if (billingCycle === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
}

/**
 * Get base URL for callbacks
 * Reads from shopify.app.toml first, then falls back to environment variables
 */
export function getBaseUrl(): string {
  // Try to get from shopify.app.toml first
  let baseUrl = getApplicationUrl();
  
  // Remove trailing slash if present
  if (baseUrl && baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  if (!baseUrl) {
    throw new Error('Application URL not configured. Please set application_url in shopify.app.toml or NEXT_PUBLIC_APP_URL/APPLICATION_URL environment variable.');
  }
  
  return baseUrl;
}

/**
 * Get subscription by ID
 * Handles both GID format (gid://shopify/AppSubscription/123) and plain ID
 */
export async function getSubscription(
  shopUrl: string,
  subscriptionId: string
): Promise<ShopifySubscription | null> {
  try {
    const shop = await getShopWithToken(shopUrl);
    
    // Ensure subscription ID is in GID format if it's not already
    let gid = subscriptionId;
    if (!subscriptionId.startsWith('gid://')) {
      gid = `gid://shopify/AppSubscription/${subscriptionId}`;
    }
    
    const result = await executeGraphQL<{ appSubscription: ShopifySubscription }>(
      shopUrl,
      shop.accessToken,
      QUERIES.GET_SUBSCRIPTION,
      { id: gid }
    );

    if (result.errors) {
      // Try with original ID if GID format failed
      if (gid !== subscriptionId) {
        const retryResult = await executeGraphQL<{ appSubscription: ShopifySubscription }>(
          shopUrl,
          shop.accessToken,
          QUERIES.GET_SUBSCRIPTION,
          { id: subscriptionId }
        );
        
        if (retryResult.errors) {
          throw new Error(retryResult.errors[0]?.message || 'Failed to fetch subscription');
        }
        
        return retryResult.data?.appSubscription || null;
      }
      throw new Error(result.errors[0]?.message || 'Failed to fetch subscription');
    }

    const subscription = result.data?.appSubscription;

    return subscription || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Get active subscription for a shop
 * Note: activeSubscriptions should include both ACTIVE and ACCEPTED subscriptions
 */
export async function getActiveSubscription(
  shopUrl: string
): Promise<ShopifySubscription | null> {
  const shop = await getShopWithToken(shopUrl);
  const result = await executeGraphQL<{
    appInstallation: {
      activeSubscriptions: ShopifySubscription[];
    };
  }>(shopUrl, shop.accessToken, QUERIES.LIST_ACTIVE_SUBSCRIPTIONS);

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch subscriptions');
  }

  const subscriptions = result.data?.appInstallation?.activeSubscriptions || [];
  
  // Only accept statuses that indicate the subscription is confirmed and active on Shopify
  // - ACTIVE: Subscription is active and billing
  // - ACCEPTED: Subscription has been confirmed by the merchant
  // We do NOT accept PENDING as it may not be fully confirmed yet
  const validStatuses = ['ACTIVE', 'ACCEPTED'];
  const found = subscriptions.find((sub) => validStatuses.includes(sub.status));
  
  return found || null;
}

/**
 * Create a subscription and return confirmation URL
 */
export async function createSubscription(
  shopUrl: string,
  price: number,
  billingCycle: BillingCycle
): Promise<string> {
  const shop = await getShopWithToken(shopUrl);
  const interval = billingCycle === 'monthly' ? 'EVERY_30_DAYS' : 'ANNUAL';
  const baseUrl = getBaseUrl();
  const returnUrl = `${baseUrl}/api/billing/confirm?shop=${encodeURIComponent(shopUrl)}`;

  const variables = {
    name: `Leadcod ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: price, currencyCode: 'USD' },
            interval: interval,
          },
        },
      },
    ],
    returnUrl: returnUrl,
    test: true, // Enable test mode
  };

  const result = await executeGraphQL<{
    appSubscriptionCreate: {
      appSubscription?: ShopifySubscription;
      confirmationUrl?: string;
      userErrors?: Array<{ field: string; message: string }>;
    };
  }>(shopUrl, shop.accessToken, QUERIES.CREATE_SUBSCRIPTION, variables);

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to create subscription');
  }

  const subscriptionData = result.data?.appSubscriptionCreate;

  if (subscriptionData?.userErrors && subscriptionData.userErrors.length > 0) {
    throw new Error(subscriptionData.userErrors[0]?.message || 'Failed to create subscription');
  }

  if (!subscriptionData?.confirmationUrl) {
    throw new Error('No confirmation URL returned from Shopify. The app may need to be published or the billing API may not be available.');
  }

  return subscriptionData.confirmationUrl;
}

/**
 * Activate plan from charge (retrieve data from charge_id)
 * For recurring charges, planExpiresAt should be null (recurring charges don't expire)
 * Only set planExpiresAt to null when status is cancelled (and downgrade to FREE)
 */
export async function activatePlanFromCharge(
  shopUrl: string,
  chargeId: string
): Promise<void> {
  try {
    const shop = await getShopWithToken(shopUrl);
    
    // Get charge details
    const chargeDetails = await getChargeDetails(shopUrl, chargeId);
    
    if (!chargeDetails) {
      throw new Error('Failed to fetch charge details');
    }
    
    // If charge is cancelled, mark subscription as cancelled and downgrade to free plan
    if (chargeDetails.status === 'cancelled' || chargeDetails.cancelled_on) {
      // Update or create cancelled subscription record
      const existingSubscription = await prisma.subscription.findFirst({
        where: { 
          shopId: shop.id,
          shopifyChargeId: chargeId
        }
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'cancelled',
            cancelledAt: chargeDetails.cancelled_on ? new Date(chargeDetails.cancelled_on) : new Date(),
          }
        });
      } else {
        await prisma.subscription.create({
          data: {
            shopId: shop.id,
            shopifyChargeId: chargeId,
            status: 'cancelled',
            startedAt: chargeDetails.created_at ? new Date(chargeDetails.created_at) : new Date(),
            cancelledAt: chargeDetails.cancelled_on ? new Date(chargeDetails.cancelled_on) : new Date(),
            price: chargeDetails.price ? parseFloat(chargeDetails.price) : null,
          }
        });
      }

      // Downgrade shop to free plan
      await prisma.shop.update({
        where: { id: shop.id },
        data: {
          plan: PlanType.FREE,
        },
      });
      return;
    }
    
    // Only activate if charge is active
    if (chargeDetails.status !== 'active') {
      throw new Error(`Charge is not active (status: ${chargeDetails.status})`);
    }

    // Extract subscription start date (prefer activated_on, fallback to created_at)
    const subscriptionStartedAt = chargeDetails.activated_on 
      ? new Date(chargeDetails.activated_on)
      : chargeDetails.created_at 
      ? new Date(chargeDetails.created_at)
      : new Date();

    // Extract subscription status
    const subscriptionStatus = chargeDetails.status || 'active';

    // For recurring charges, expiresAt should be null (recurring charges don't expire)
    const expiresAt = null;

    // Check if subscription already exists for this charge
    const existingSubscription = await prisma.subscription.findFirst({
      where: { 
        shopId: shop.id,
        shopifyChargeId: chargeId
      }
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: subscriptionStatus,
          startedAt: subscriptionStartedAt,
          expiresAt,
          cancelledAt: null, // Clear cancellation if reactivating
          price: chargeDetails.price ? parseFloat(chargeDetails.price) : existingSubscription.price,
        }
      });
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          shopId: shop.id,
          shopifyChargeId: chargeId,
          status: subscriptionStatus,
          startedAt: subscriptionStartedAt,
          expiresAt,
          price: chargeDetails.price ? parseFloat(chargeDetails.price) : null,
          currencyCode: 'USD',
        }
      });
    }

    // Update shop plan to paid
    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        plan: PlanType.PAID,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Activate plan for a shop based on subscription
 * Note: This is kept for backward compatibility but should use activatePlanFromCharge for recurring charges
 */
export async function activatePlanFromSubscription(
  shopUrl: string,
  subscription?: ShopifySubscription | null
): Promise<void> {
  try {
    const shop = await getShopWithToken(shopUrl);
    
    // If no subscription provided, try to find active one
    let activeSubscription = subscription;
    if (!activeSubscription) {
      activeSubscription = await getActiveSubscription(shopUrl);
    }
    
    if (!activeSubscription) {
      throw new Error('No subscription found');
    }
    
    // Only accept statuses that indicate the subscription is confirmed and active on Shopify
    // - ACTIVE: Subscription is active and billing
    // - ACCEPTED: Subscription has been confirmed by the merchant
    // We do NOT accept PENDING as it may not be fully confirmed yet
    const validStatuses = ['ACTIVE', 'ACCEPTED'];
    
    if (!validStatuses.includes(activeSubscription.status)) {
      throw new Error(`Subscription is not in a valid state (status: ${activeSubscription.status}). Expected one of: ${validStatuses.join(', ')}`);
    }

    // For recurring subscriptions, expiresAt should be null (recurring subscriptions don't expire)
    const expiresAt = activeSubscription.currentPeriodEnd 
      ? new Date(activeSubscription.currentPeriodEnd)
      : null;

    const startedAt = new Date();

    // Check if active subscription already exists for this shop
    const existingSubscription = await prisma.subscription.findFirst({
      where: { 
        shopId: shop.id,
        status: {
          in: ['active', 'ACTIVE', 'ACCEPTED']
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: activeSubscription.status,
          expiresAt,
          cancelledAt: null, // Clear cancellation if reactivating
        }
      });
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          shopId: shop.id,
          status: activeSubscription.status,
          startedAt,
          expiresAt,
          currencyCode: 'USD',
        }
      });
    }

    // Update shop plan to paid
    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        plan: PlanType.PAID,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get charge status from Shopify REST API
 */
async function getChargeStatus(
  shopUrl: string,
  accessToken: string,
  chargeId: string
): Promise<{ status: string; active: boolean } | null> {
  try {
    const response = await fetch(
      `https://${shopUrl}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const charge = data.recurring_application_charge;
    
    if (!charge) {
      return null;
    }

    return {
      status: charge.status,
      active: charge.status === 'active',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get full charge details from Shopify REST API
 */
export async function getChargeDetails(
  shopUrl: string,
  chargeId: string
): Promise<{
  id: string;
  status: string;
  name?: string;
  price?: string;
  cancelled_on?: string | null;
  activated_on?: string | null;
  created_at?: string | null;
  [key: string]: any;
} | null> {
  try {
    const shop = await getShopWithToken(shopUrl);

    const response = await fetch(
      `https://${shopUrl}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const charge = data.recurring_application_charge;
    
    if (!charge) {
      return null;
    }

    return charge;
  } catch (error) {
    return null;
  }
}

/**
 * Activate a recurring application charge
 */
export async function activateCharge(
  shopUrl: string,
  chargeId: string
): Promise<boolean> {
  try {
    const shop = await getShopWithToken(shopUrl);

    // First, check if charge is already active
    const chargeStatus = await getChargeStatus(shopUrl, shop.accessToken, chargeId);
    
    if (chargeStatus?.active) {
      return true;
    }

    // Activate the charge
    const response = await fetch(
      `https://${shopUrl}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}/activate.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const charge = data.recurring_application_charge;

    if (charge && charge.status === 'active') {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Verify and activate subscription by ID
 */
export async function verifyAndActivateSubscription(
  shopUrl: string,
  subscriptionId: string
): Promise<boolean> {
  try {
    const subscription = await getSubscription(shopUrl, subscriptionId);
    
    if (!subscription) {
      return false;
    }
    
    // Only accept statuses that indicate the subscription is confirmed and active on Shopify
    // - ACTIVE: Subscription is active and billing
    // - ACCEPTED: Subscription has been confirmed by the merchant
    // We do NOT accept PENDING as it may not be fully confirmed yet
    const validStatuses = ['ACTIVE', 'ACCEPTED'];
    
    if (validStatuses.includes(subscription.status)) {
      await activatePlanFromSubscription(shopUrl, subscription);
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
