"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createApp } from "@shopify/app-bridge/client";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import { initializeShopWithToken } from "@/app/actions/shopify-auth";
import OnboardingCard from "@/app/components/Onboarding/OnboardingCard";
import PlanSidebar from "@/app/components/Onboarding/PlanSidebar";
import {
  getOnboardingProgress,
  type OnboardingStep,
} from "@/app/actions/onboarding";
import { FullPageLoader } from "@/components/ui/loader";

export default function Home() {
  const t = useTranslations("home");
  const shopify = useAppBridge();
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean | null;
  }>({
    loading: false,
    success: null,
  });
  const [onboardingProgress, setOnboardingProgress] = useState<{
    completedSteps: OnboardingStep[];
    loading: boolean;
  }>({
    completedSteps: [],
    loading: true,
  });
  const [shopUrl, setShopUrl] = useState<string>("");

  useEffect(() => {
    const initializeShop = async () => {
      try {
        const app = createApp({
          apiKey: shopify.config.apiKey || "",
          host: shopify.config.host || "",
        });

        const currentShopUrl = shopify.config.shop || "";
        setShopUrl(currentShopUrl);

        if (!currentShopUrl) {
          setStatus({
            loading: false,
            success: false,
          });
          setOnboardingProgress({ completedSteps: [], loading: false });
          return;
        }
        setStatus({ loading: true, success: null });
        const sessionToken = await getSessionToken(app);

        const result = await initializeShopWithToken(
          sessionToken,
          currentShopUrl
        );

        if (result.success) {
          setStatus({
            loading: false,
            success: true,
          });

          // Load onboarding progress only after shop is successfully initialized
          try {
            const progress = await getOnboardingProgress(currentShopUrl);
            setOnboardingProgress({
              completedSteps: progress.completedSteps,
              loading: false,
            });
          } catch (error) {
            console.error("Error loading onboarding progress:", error);
            setOnboardingProgress({ completedSteps: [], loading: false });
          }
        } else {
          setStatus({
            loading: false,
            success: false,
          });
          setOnboardingProgress({ completedSteps: [], loading: false });
        }
      } catch (error) {
        console.error("Error initializing shop:", error);
        setStatus({
          loading: false,
          success: false,
        });
        setOnboardingProgress({ completedSteps: [], loading: false });
      }
    };

    if (shopify.config.host) {
      initializeShop();
    }
  }, [shopify]);

  // Show full-page loader while loading or initializing
  if (
    status.loading ||
    onboardingProgress.loading ||
    !status.success ||
    !shopUrl
  ) {
    return <FullPageLoader message="Loading..." />;
  }

  return (
    <>
      <s-page heading="Inboarding" />
      <div className="flex gap-6 p-6">
        <div className="flex-1">
          <OnboardingCard
            shopUrl={shopUrl}
            completedSteps={onboardingProgress.completedSteps}
            onProgressUpdate={async () => {
              const progress = await getOnboardingProgress(shopUrl);
              setOnboardingProgress({
                completedSteps: progress.completedSteps,
                loading: false,
              });
            }}
          />
        </div>
        <aside className="w-80 shrink-0">
          <PlanSidebar shopUrl={shopUrl} />
        </aside>
      </div>
    </>
  );
}
