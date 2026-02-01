"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@/app/components/ui/font-awesome-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { markOnboardingStepComplete, type OnboardingStep as OnboardingStepType } from "@/app/actions/onboarding";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const REQUIRED_STEP_IDS: OnboardingStepType[] = ['configure-form', 'configure-shipping', 'activate-plugin'];

interface OnboardingStepItem {
  id: OnboardingStepType;
  title: string;
  description: string;
  optional?: boolean;
  action: () => void;
}

interface OnboardingCardProps {
  shopUrl: string;
  completedSteps: OnboardingStepType[];
  onProgressUpdate?: () => void;
}

export default function OnboardingCard({ shopUrl, completedSteps, onProgressUpdate }: OnboardingCardProps) {
  const router = useRouter();
  const shopify = useAppBridge();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const t = useTranslations('onboarding');

  const steps: OnboardingStepItem[] = [
    {
      id: 'configure-form',
      title: t('steps.configureForm.title'),
      description: t('steps.configureForm.description'),
      action: async () => {
        setIsProcessing('configure-form');
        const result = await markOnboardingStepComplete(shopUrl, 'configure-form');
        if (result.success && onProgressUpdate) {
          await onProgressUpdate();
        }
        router.push(`/form-builder?shop=${encodeURIComponent(shopUrl)}`);
      }
    },
    {
      id: 'configure-shipping',
      title: t('steps.configureShipping.title'),
      description: t('steps.configureShipping.description'),
      action: async () => {
        setIsProcessing('configure-shipping');
        const result = await markOnboardingStepComplete(shopUrl, 'configure-shipping');
        if (result.success && onProgressUpdate) {
          await onProgressUpdate();
        }
        router.push(`/shipping-fees?shop=${encodeURIComponent(shopUrl)}`);
      }
    },
    {
      id: 'activate-plugin',
      title: t('steps.activatePlugin.title'),
      description: t('steps.activatePlugin.description'),
      action: async () => {
        setIsProcessing('activate-plugin');
        const result = await markOnboardingStepComplete(shopUrl, 'activate-plugin');
        if (result.success && onProgressUpdate) {
          await onProgressUpdate();
        }
        // Redirect to Shopify theme editor product page where user can embed the extension
        const shop = shopUrl.replace('.myshopify.com', '');
        const themeEditorUrl = `https://${shop}.myshopify.com/admin/themes/current/editor?template=product`;
        window.open(themeEditorUrl, '_blank');
        setIsProcessing(null);
      }
    },
    {
      id: 'link-pixels',
      title: t('steps.linkPixels.title'),
      description: t('steps.linkPixels.description'),
      optional: true,
      action: async () => {
        setIsProcessing('link-pixels');
        const result = await markOnboardingStepComplete(shopUrl, 'link-pixels');
        if (result.success && onProgressUpdate) {
          await onProgressUpdate();
        }
        router.push(`/pixels?shop=${encodeURIComponent(shopUrl)}`);
        setIsProcessing(null);
      }
    }
  ];

  const requiredStepsCount = REQUIRED_STEP_IDS.length;
  const completedRequiredCount = completedSteps.filter((s) => REQUIRED_STEP_IDS.includes(s)).length;
  const progressPercentage = (completedRequiredCount / requiredStepsCount) * 100;

  const allStepsCompleted = completedRequiredCount === requiredStepsCount;

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('progress')}</span>
            <span className="font-medium">{t('completed', { completedCount: completedRequiredCount, totalSteps: requiredStepsCount })}</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isProcessingStep = isProcessing === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  isCompleted
                    ? 'bg-muted/50 border-muted'
                    : 'bg-background border-border hover:bg-accent/50'
                }`}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-muted-foreground bg-muted/50 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <FontAwesomeIcon icon="Check" size={14} className="text-white" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                    {step.title}
                    {step.optional && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">({t('optional')})</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Button
                  onClick={step.action}
                  disabled={isCompleted || isProcessingStep || !!isProcessing}
                  size="sm"
                  className="shrink-0"
                >
                  {isProcessingStep ? (
                    t('buttons.loading')
                  ) : isCompleted ? (
                    t('buttons.done')
                  ) : (
                    <>
                      {step.id === 'activate-plugin' ? t('buttons.openThemeEditor') : step.id === 'link-pixels' ? t('buttons.linkPixels') : t('buttons.getStarted')}
                      <FontAwesomeIcon icon="ArrowRight" size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {allStepsCompleted && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              {t('allCompleted')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
