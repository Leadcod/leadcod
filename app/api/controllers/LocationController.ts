import { t } from 'elysia'
import { prisma } from '@/lib/prisma'

export class LocationController {
  static async getStates(ctx: { query?: Record<string, string> }) {
    try {
      const where: Record<string, string> = {}
      const query = ctx.query ?? {}
      if (query.countryId) {
        where.countryId = query.countryId
      } else {
        // Default to Algeria if no country specified
        const algeria = await prisma.country.findFirst({
          where: { name: 'Algeria' }
        });
        if (algeria) {
          where.countryId = algeria.id;
        }
      }

      const states = await prisma.state.findMany({
        where,
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          nameAr: true,
        }
      });

      return {
        success: true,
        data: states
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getCities(ctx: { query?: Record<string, string> }) {
    const stateId = (ctx.query?.stateId ?? '') as string
    
    if (!stateId) {
      return {
        success: false,
        error: 'stateId parameter is required'
      };
    }

    try {
      const cities = await prisma.city.findMany({
        where: { stateId },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          nameAr: true,
        }
      });

      return {
        success: true,
        data: cities
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static getStatesSchema = {
    query: t.Object({
      countryId: t.Optional(t.String())
    })
  }

  static async getShippingFees(ctx: { query?: Record<string, string> }) {
    const { shopUrl, stateId } = (ctx.query ?? {}) as { shopUrl?: string; stateId?: string }
    
    if (!shopUrl || !stateId) {
      return {
        success: false,
        error: 'shopUrl and stateId parameters are required'
      };
    }

    try {
      const { getShippingFeesForState } = await import('@/app/actions/shipping');
      const result = await getShippingFeesForState(shopUrl, stateId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static getCitiesSchema = {
    query: t.Object({
      stateId: t.String()
    })
  }

  static getShippingFeesSchema = {
    query: t.Object({
      shopUrl: t.String(),
      stateId: t.String()
    })
  }
}

