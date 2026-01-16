import { t } from 'elysia'
import { getBaseUrl, getChargeDetails, activateCharge, activatePlanFromCharge } from '@/lib/shopify/billing'
import { getShopifyAdminUrl } from '@/lib/constants/shopify'

export class BillingController {
  static async confirm({ query, request }: { 
    query: { 
      shop?: string
      charge_id?: string
    },
    request?: Request
  }) {
    const shop = query.shop;
    const chargeId = query.charge_id;

    // If we have shop and charge_id, fetch charge details and activate
    if (shop && chargeId) {
      try {
        // Get charge details
        const chargeDetails = await getChargeDetails(shop, chargeId);
        
        if (!chargeDetails) {
          throw new Error('Failed to fetch charge details');
        }

        // Activate the charge
        await activateCharge(shop, chargeId);

        // Get updated charge details after activation
        const updatedChargeDetails = await getChargeDetails(shop, chargeId);

        // Activate plan from charge (only if charge is active)
        if (updatedChargeDetails?.status === 'active' || chargeDetails.status === 'active') {
          await activatePlanFromCharge(shop, chargeId);
        }
      } catch (error) {
        // Error handling
      }
    }

    // Redirect to Shopify admin /plans page
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
      shop: t.Optional(t.String()),
      charge_id: t.Optional(t.String())
    })
  }
}
