"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
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
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const initializeShop = async () => {
      try {
        // Use App Bridge config first, fallback to URL search params (Shopify passes shop & host in URL)
        const currentShopUrl =
          shopify.config.shop || searchParams.get("shop") || "";
        const host = shopify.config.host || searchParams.get("host") || "";

        setShopUrl(currentShopUrl);

        if (!currentShopUrl) {
          setStatus({ loading: false, success: false });
          setOnboardingProgress({ completedSteps: [], loading: false });
          return;
        }

        setStatus({ loading: true, success: null });

        const app = createApp({
          apiKey: shopify.config.apiKey || "",
          host: host,
        });

        const sessionToken = await getSessionToken(app);

        const result = await initializeShopWithToken(
          sessionToken,
          currentShopUrl
        );

        if (result.success) {
          setStatus({ loading: false, success: true });

          try {
            const progress = await getOnboardingProgress(currentShopUrl);
            setOnboardingProgress({
              completedSteps: progress.completedSteps,
              loading: false,
            });
          } catch {
            setOnboardingProgress({ completedSteps: [], loading: false });
          }
        } else {
          setStatus({ loading: false, success: false });
          setOnboardingProgress({ completedSteps: [], loading: false });
        }
      } catch {
        setStatus({ loading: false, success: false });
        setOnboardingProgress({ completedSteps: [], loading: false });
      }
    };

    // Run when we have shop (from App Bridge or URL) or host
    const hasShop = shopify.config.shop || searchParams.get("shop");
    const hasHost = shopify.config.host || searchParams.get("host");
    if (hasShop || hasHost) {
      initializeShop();
    } else {
      setStatus({ loading: false, success: false });
      setOnboardingProgress({ completedSteps: [], loading: false });
    }
  }, []);

  // Still initializing (waiting for config)
  if (status.success === null && !status.loading) {
    return <FullPageLoader message="Loading..." />;
  }

  // Actually loading
  if (status.loading || onboardingProgress.loading) {
    return <FullPageLoader message="Loading..." />;
  }

  // Failed or missing shop
  if (!status.success || !shopUrl) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <p className="text-muted-foreground text-center">
          {t("loadError")}
        </p>
      </div>
    );
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
