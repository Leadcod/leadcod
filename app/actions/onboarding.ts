'use client';

export type OnboardingStep = 'configure-form' | 'configure-shipping' | 'activate-plugin';

export async function getOnboardingProgress(shopUrl: string): Promise<{ completedSteps: OnboardingStep[] }> {
  try {
    const response = await fetch(`/api/onboarding?shop=${encodeURIComponent(shopUrl)}`);
    const result = await response.json();
    
    if (result.success) {
      return { completedSteps: result.data.completedSteps || [] };
    }
    
    return { completedSteps: [] };
  } catch (error) {
    return { completedSteps: [] };
  }
}

export async function markOnboardingStepComplete(shopUrl: string, step: OnboardingStep): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: shopUrl,
        step: step
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true };
    }
    
    return { success: false, error: result.error || 'Failed to save progress' };
  } catch (error) {
    return { success: false, error: 'Failed to save progress' };
  }
}
