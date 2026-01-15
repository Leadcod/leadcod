import { t } from 'elysia'
import { prisma } from '@/lib/prisma'

export type OnboardingStep = 'configure-form' | 'configure-shipping' | 'activate-plugin';

export class OnboardingController {
  static async getProgress({ query }: { query: { shop: string } }) {
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
        include: { onboardingProgress: true }
      });

      if (!shop) {
        return {
          success: true,
          data: { completedSteps: [] as OnboardingStep[] }
        };
      }

      if (!shop.onboardingProgress) {
        return {
          success: true,
          data: { completedSteps: [] as OnboardingStep[] }
        };
      }

      return {
        success: true,
        data: {
          completedSteps: shop.onboardingProgress.completedSteps as OnboardingStep[]
        }
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async markStepComplete({ body }: { body: { shop: string; step: OnboardingStep } }) {
    const { shop: shopUrl, step } = body;
    
    if (!shopUrl || !step) {
      return {
        success: false,
        error: 'shop and step parameters are required'
      };
    }

    try {
      let shop = await prisma.shop.findFirst({
        where: { url: shopUrl }
      });

      if (!shop) {
        return {
          success: false,
          error: 'Shop not found. Please initialize the shop first.'
        };
      }

      const existingProgress = await prisma.onboardingProgress.findUnique({
        where: { shopId: shop.id }
      });

      const completedSteps = existingProgress 
        ? (existingProgress.completedSteps as OnboardingStep[])
        : [];

      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }

      if (existingProgress) {
        await prisma.onboardingProgress.update({
          where: { shopId: shop.id },
          data: {
            completedSteps: completedSteps as any,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.onboardingProgress.create({
          data: {
            shopId: shop.id,
            completedSteps: completedSteps as any
          }
        });
      }

      return {
        success: true,
        data: { completedSteps }
      };
    } catch (error) {
      console.error('Error marking onboarding step complete:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save progress'
      };
    }
  }

  static getProgressSchema = {
    query: t.Object({
      shop: t.String()
    })
  }

  static markStepCompleteSchema = {
    body: t.Object({
      shop: t.String(),
      step: t.String()
    })
  }
}
