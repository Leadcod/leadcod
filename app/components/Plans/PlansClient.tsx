'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppBridge } from "@shopify/app-bridge-react";
import { createApp } from "@shopify/app-bridge/client";
import { Redirect } from "@shopify/app-bridge/actions";
import { getPlanInfo, setPlan, type PlanInfo } from "@/app/actions/plan";
import { PlanType } from "@/lib/constants/plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@/app/components/ui/font-awesome-icon";
import { cn } from "@/lib/utils";

interface PlansClientProps {
  shopUrl: string;
  initialPlanInfo: PlanInfo;
}

export default function PlansClient({ shopUrl, initialPlanInfo }: PlansClientProps) {
  const t = useTranslations("plans");
  const appBridge = useAppBridge();
  const [planInfo, setPlanInfo] = useState<PlanInfo>(initialPlanInfo);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [savingPlan, setSavingPlan] = useState(false);

  const handleSubscribe = async (planType: PlanType) => {
    if (!shopUrl) return;
    
    setSavingPlan(true);
    try {
      // Pass billing cycle when subscribing to paid plan
      const billingCycleParam = planType === PlanType.PAID ? billingCycle : undefined;
      const result = await setPlan(shopUrl, planType, billingCycleParam);
      
      if (result.success) {
        // If we have a confirmation URL, redirect to Shopify billing page using App Bridge
        if (result.confirmationUrl) {
          const app = createApp({
            apiKey: appBridge.config.apiKey || "",
            host: appBridge.config.host || "",
          });
          const redirect = Redirect.create(app);
          redirect.dispatch(Redirect.Action.REMOTE, result.confirmationUrl);
          return;
        }
        
        // Reload plan info to reflect the change
        const updatedInfo = await getPlanInfo(shopUrl);
        setPlanInfo(updatedInfo);
        
        // Show success message
        alert(t("planUpdated") || "Plan updated successfully");
      } else {
        alert(result.error || "Failed to update plan");
      }
    } catch (error) {
      alert("An error occurred while updating the plan");
    } finally {
      setSavingPlan(false);
    }
  };

  const { planType, paidTierPriceMonthly, paidTierPriceYearly, planExpiresAt, isExpired } = planInfo;
  const paidPrice = billingCycle === "monthly" ? paidTierPriceMonthly : paidTierPriceYearly;
  
  // Format expiration date
  const formatExpirationDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  const expirationDateFormatted = formatExpirationDate(planExpiresAt);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon="CreditCard" size={24} className="text-primary" />
          <h1 className="text-4xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("description")}</p>
      </div>

      {/* Current Plan Badge */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium shadow-sm bg-primary/10 text-primary">
          <FontAwesomeIcon 
            icon={planType === PlanType.FREE ? "Tag" : "Crown"} 
            size={16} 
          />
          <span>
            {t("currentPlan")}: {planType === PlanType.FREE ? t("freePlan") : t("paidPlan")}
          </span>
        </div>
        {planType === PlanType.PAID && (
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            planExpiresAt && isExpired
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : planExpiresAt
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          )}>
            <FontAwesomeIcon 
              icon={planExpiresAt && isExpired ? "ExclamationTriangle" : planExpiresAt ? "Calendar" : "Infinity"} 
              size={14} 
            />
            <span>
              {planExpiresAt 
                ? (isExpired ? "Expired" : "Expires") + ": " + expirationDateFormatted
                : "Recurring subscription"
              }
            </span>
          </div>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-xl border-2 bg-muted/50 p-1.5 shadow-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FontAwesomeIcon icon="Calendar" size={14} />
            {t("monthly")}
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FontAwesomeIcon icon="Star" size={14} />
            {t("yearly")} 
            <span className="text-xs font-bold text-primary">
              ({t("save")})
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <Card className={cn(
          "relative overflow-visible transition-all duration-300 flex flex-col h-full",
          planType === PlanType.FREE 
            ? "ring-2 ring-primary shadow-lg" 
            : "hover:shadow-md"
        )}>
          {planType === PlanType.FREE && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <FontAwesomeIcon icon="CheckCircle" size={11} />
                {t("current")}
              </span>
            </div>
          )}
          <CardHeader className={cn("relative", planType === PlanType.FREE && "pt-8")}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10">
                <FontAwesomeIcon icon="Tag" size={24} className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("freePlan")}</CardTitle>
                <CardDescription className="mt-1">{t("freePlanDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative flex-1 flex flex-col">
            <div className="pb-4 border-b">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-foreground">{t("free")}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <FontAwesomeIcon icon="Infinity" size={14} />
                <span>{t("forever")}</span>
              </div>
            </div>

            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">{t("features.free.orders", { count: 50 })}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Perfect for testing</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">{t("features.free.support")}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Community support</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">All core features</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Form builder & shipping</p>
                </div>
              </li>
            </ul>

            <Button
              variant={planType === PlanType.FREE ? "secondary" : "default"}
              className="w-full font-semibold mt-auto"
              disabled={planType === PlanType.FREE || savingPlan}
              onClick={() => handleSubscribe(PlanType.FREE)}
            >
              {savingPlan ? (
                <>
                  <FontAwesomeIcon icon="ArrowPath" size={16} className="mr-2 animate-spin" />
                  {t("saving") || "Saving..."}
                </>
              ) : planType === PlanType.FREE ? (
                <>
                  <FontAwesomeIcon icon="CheckCircle" size={16} className="mr-2" />
                  {t("currentPlan")}
                </>
              ) : (
                <>
                  {t("selectPlan")}
                  <FontAwesomeIcon icon="ArrowRight" size={16} className="ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Paid Plan */}
        <Card className={cn(
          "relative overflow-visible transition-all duration-300 border-2 flex flex-col h-full",
          planType === PlanType.PAID 
            ? "ring-2 ring-primary border-primary shadow-lg" 
            : "border-primary/30 hover:border-primary/50 hover:shadow-lg"
        )}>
          {planType === PlanType.PAID && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <FontAwesomeIcon icon="Crown" size={11} />
                {t("current")}
              </span>
            </div>
          )}
          {planType === PlanType.FREE && (
            <div className="absolute -top-3 right-4 z-10">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <FontAwesomeIcon icon="Star" size={11} />
                {t("popular")}
              </span>
            </div>
          )}
          <CardHeader className={cn("relative", (planType === PlanType.PAID || planType === PlanType.FREE) && "pt-8")}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10">
                <FontAwesomeIcon icon="Crown" size={24} className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("paidPlan")}</CardTitle>
                <CardDescription className="mt-1">{t("paidPlanDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative flex-1 flex flex-col">
            <div className="pb-4 border-b">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-foreground">${paidPrice}</span>
                <span className="text-lg font-normal text-muted-foreground">
                  /{billingCycle === "monthly" ? t("month") : t("year")}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground line-through">
                    ${paidTierPriceMonthly * 12}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    Save ${(paidTierPriceMonthly * 12 - paidTierPriceYearly).toFixed(0)}/year
                  </span>
                </div>
              )}
              {billingCycle === "monthly" && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <FontAwesomeIcon icon="InfoCircle" size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("or")} ${paidTierPriceYearly}/{t("year")} {t("ifPaidYearly")}
                  </span>
                </div>
              )}
            </div>

            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">{t("features.paid.orders")}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">No limits, scale freely</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">{t("features.paid.support")}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Priority email & chat</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">Advanced features</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Custom integrations & APIs</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                  <FontAwesomeIcon icon="Check" size={16} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">Analytics dashboard</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Track performance metrics</p>
                </div>
              </li>
            </ul>

            <Button
              variant={planType === PlanType.PAID ? "secondary" : "default"}
              className="w-full font-semibold mt-auto"
              disabled={planType === PlanType.PAID || savingPlan}
              onClick={() => handleSubscribe(PlanType.PAID)}
            >
              {savingPlan ? (
                <>
                  <FontAwesomeIcon icon="ArrowPath" size={16} className="mr-2 animate-spin" />
                  {t("saving") || "Saving..."}
                </>
              ) : planType === PlanType.PAID ? (
                <>
                  <FontAwesomeIcon icon="CheckCircle" size={16} className="mr-2" />
                  {t("currentPlan")}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="Crown" size={16} className="mr-2" />
                  {t("subscribe")}
                  <FontAwesomeIcon icon="ArrowRight" size={16} className="ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
