import { t } from 'elysia'
import { prisma } from '@/lib/prisma'

export class LocationController {
  static async getStates({ query }: { query: { countryId?: string } }) {
    try {
      const where: any = {};
      
      // If countryId is provided, filter by country
      if (query.countryId) {
        where.countryId = query.countryId;
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
      console.error('Error fetching states:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getCities({ query }: { query: { stateId: string } }) {
    const stateId = query.stateId as string;
    
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
      console.error('Error fetching cities:', error);
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

  static getCitiesSchema = {
    query: t.Object({
      stateId: t.String()
    })
  }
}

