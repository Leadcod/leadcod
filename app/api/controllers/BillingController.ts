import { t } from 'elysia'
import { getBaseUrl } from '@/lib/shopify/billing'
import { getShopifyAdminUrl } from '@/lib/constants/shopify'

export class BillingController {
  static async confirm({ query }: { 
    query: { 
      shop?: string
    },
    request?: Request
  }) {
    const shop = query.shop;

    // Subscription activation is handled by app_subscriptions/update webhook.
    // After merchant approves, Shopify sends the webhook with status ACTIVE.
    // Just redirect to plans page.
    if (shop) {
      const redirectUrl = getShopifyAdminUrl(shop, '/plans');
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl
        }
      });
    }
    
    // Fallback to base URL if shop is not provided
    const baseUrl = getBaseUrl();
    const redirectUrl = `${baseUrl}/plans`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl
      }
    });
  }

  static confirmSchema = {
    query: t.Object({
      shop: t.Optional(t.String())
    })
  }
}
