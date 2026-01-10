import { t } from 'elysia'
import { prisma } from '@/lib/prisma'

export class FormController {
  static async getForm({ query }: { query: { shop: string } }) {
    const shopUrl = query.shop as string;
    
    if (!shopUrl) {
      return {
        success: false,
        error: 'shop parameter is required'
      };
    }

    try {
      const shop = await prisma.shop.findFirst({
        where: { url: shopUrl },
        include: { Form: true, shippingSettings: true }
      });

      if (!shop || !shop.Form[0]) {
        return {
          success: false,
          error: 'Form not found for this shop'
        };
      }

      const form = shop.Form[0];
      
      // Get shipping settings
      const shippingSettings = shop.shippingSettings ? {
        method: shop.shippingSettings.method,
        stopDeskEnabled: shop.shippingSettings.stopDeskEnabled,
        codLabel: shop.shippingSettings.codLabel || 'Cash on Delivery',
        stopDeskLabel: shop.shippingSettings.stopDeskLabel || 'Stop Desk'
      } : {
        method: 'free' as const,
        stopDeskEnabled: false,
        codLabel: 'Cash on Delivery',
        stopDeskLabel: 'Stop Desk'
      };
      
      return {
        success: true,
        data: {
          fields: form.fields,
          settings: form.settings || {},
          shippingSettings
        }
      };
    } catch (error) {
      console.error('Error fetching form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static getFormSchema = {
    query: t.Object({
      shop: t.String()
    })
  }
}

