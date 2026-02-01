"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPlanInfo, type PlanInfo } from "@/app/actions/plan";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@/app/components/ui/font-awesome-icon";
import { PlanType } from "@/lib/constants/plan";
import { cn } from "@/lib/utils";

interface PlanSidebarProps {
  shopUrl: string;
}

export default function PlanSidebar({ shopUrl }: PlanSidebarProps) {
  const t = useTranslations('plan');
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlanInfo = async () => {
      setLoading(true);
      try {
        const info = await getPlanInfo(shopUrl);
        setPlanInfo(info);
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    if (shopUrl) {
      loadPlanInfo();
      // Refresh every 30 seconds
      const interval = setInterval(loadPlanInfo, 30000);
      return () => clearInterval(interval);
    }
  }, [shopUrl]);

  if (loading || !planInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <FontAwesomeIcon icon="ArrowPath" size={24} className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { planType, orderCount, orderLimit, isUnlimited, paidTierPrice, paidTierPriceYearly } = planInfo;
  const progressPercentage = isUnlimited ? 0 : Math.min((orderCount / orderLimit) * 100, 100);
  const remainingOrders = isUnlimited ? null : Math.max(0, orderLimit - orderCount);
  const isFree = planType === PlanType.FREE;

  return (
    <Card className="w-full">
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            <CardDescription className="mt-1">
              {isFree ? t('freePlan') : t('paidPlan')}
            </CardDescription>
          </div>
          {/* Plan Badge */}
          <div
              className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0",
              isFree
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300"
            )}
          >
            <FontAwesomeIcon
              icon={isFree ? "Tag" : "Crown"}
              size={12}
            />
            <span>{isFree ? "Free" : "Pro"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Count Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FontAwesomeIcon icon="ShoppingCart" size={16} />
              <span>{t('ordersThisMonth')}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-2xl text-foreground">
                {orderCount}
              </span>
              {!isUnlimited && (
                <span className="text-sm text-muted-foreground font-medium">
                  / {orderLimit}
                </span>
              )}
              {isUnlimited && (
                <FontAwesomeIcon icon="Infinity" size={16} className="text-amber-600 dark:text-amber-400 ml-1" />
              )}
            </div>
          </div>
          
          {!isUnlimited && (
            <div className="space-y-2">
              <Progress 
                value={progressPercentage} 
                className={cn(
                  "h-2.5",
                  progressPercentage >= 90 ? "bg-red-200 dark:bg-red-900/30" : "",
                  progressPercentage >= 75 && progressPercentage < 90 ? "bg-yellow-200 dark:bg-yellow-900/30" : ""
                )}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  {remainingOrders !== null && remainingOrders > 0 ? (
                    <>
                      <FontAwesomeIcon icon="CheckCircle" size={12} className="text-green-600 dark:text-green-400" />
                      {t('remainingOrders', { count: remainingOrders })}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="ExclamationTriangle" size={12} className="text-red-600 dark:text-red-400" />
                      {t('limitReached')}
                    </>
                  )}
                </span>
                <span className={cn(
                  "font-semibold",
                  progressPercentage >= 90 ? "text-red-600 dark:text-red-400" : "",
                  progressPercentage >= 75 && progressPercentage < 90 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"
                )}>
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {isUnlimited && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <FontAwesomeIcon icon="Sparkles" size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {t('unlimitedOrders')}
              </span>
            </div>
          )}
        </div>

        {/* Plan Details */}
        <div className="pt-4 border-t space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <FontAwesomeIcon icon="InfoCircle" size={14} className="text-muted-foreground" />
              {t('currentPlan')}
            </h4>
            {isFree ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-2 mb-2">
                    <FontAwesomeIcon icon="CheckCircle" size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      {t('freePlanDescription', { limit: orderLimit })}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon="ArrowUpCircle" size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                        {t('upgradeToPaid', { price: paidTierPrice })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Save ${(paidTierPrice * 12 - paidTierPriceYearly).toFixed(0)}/year with annual billing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2 mb-2">
                    <FontAwesomeIcon icon="Crown" size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground font-medium">
                      {t('paidPlanDescription', { price: paidTierPrice })}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon="Check" size={10} className="text-green-600 dark:text-green-400" />
                      <span>Unlimited orders</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon="Check" size={10} className="text-green-600 dark:text-green-400" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon="Check" size={10} className="text-green-600 dark:text-green-400" />
                      <span>Advanced features</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
