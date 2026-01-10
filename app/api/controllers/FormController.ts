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
        include: { Form: true }
      });

      if (!shop || !shop.Form[0]) {
        return {
          success: false,
          error: 'Form not found for this shop'
        };
      }

      const form = shop.Form[0];
      
      return {
        success: true,
        data: {
          fields: form.fields,
          settings: form.settings || {}
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

