'use server';

import { prisma } from '@/lib/prisma';

export type OnboardingStep = 'configure-form' | 'configure-shipping' | 'activate-plugin' | 'link-pixels';

export async function getOnboardingProgress(
  shopUrl: string
): Promise<{ completedSteps: OnboardingStep[] }> {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      include: { onboardingProgress: true },
    });
    if (!shop) {
      return { completedSteps: [] };
    }
    if (!shop.onboardingProgress) {
      return { completedSteps: [] };
    }
    return {
      completedSteps: (shop.onboardingProgress.completedSteps ||
        []) as OnboardingStep[],
    };
  } catch {
    return { completedSteps: [] };
  }
}

export async function markOnboardingStepComplete(
  shopUrl: string,
  step: OnboardingStep
): Promise<{ success: boolean; error?: string }> {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
    });
    if (!shop) {
      return { success: false, error: 'Shop not found. Please initialize the shop first.' };
    }
    const existingProgress = await prisma.onboardingProgress.findUnique({
      where: { shopId: shop.id },
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
          completedSteps: completedSteps as string[],
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.onboardingProgress.create({
        data: {
          shopId: shop.id,
          completedSteps: completedSteps as string[],
        },
      });
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save progress',
    };
  }
}
