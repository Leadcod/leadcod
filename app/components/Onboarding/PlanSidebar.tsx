"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPlanInfo, type PlanInfo } from "@/app/actions/plan";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

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
        console.error('Error loading plan info:', error);
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
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { planType, orderCount, orderLimit, isUnlimited, paidTierPrice } = planInfo;
  const progressPercentage = isUnlimited ? 0 : Math.min((orderCount / orderLimit) * 100, 100);
  const remainingOrders = isUnlimited ? null : Math.max(0, orderLimit - orderCount);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {planType === 'free' ? t('freePlan') : t('paidPlan')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Count Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('ordersThisMonth')}</span>
            <span className="font-semibold text-lg">
              {orderCount} {isUnlimited ? '' : `/ ${orderLimit}`}
            </span>
          </div>
          
          {!isUnlimited && (
            <>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {remainingOrders !== null && remainingOrders > 0
                    ? t('remainingOrders', { count: remainingOrders })
                    : t('limitReached')}
                </span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
            </>
          )}

          {isUnlimited && (
            <div className="text-sm text-muted-foreground">
              {t('unlimitedOrders')}
            </div>
          )}
        </div>

        {/* Plan Details */}
        <div className="pt-4 border-t space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('currentPlan')}</h4>
            {planType === 'free' ? (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {t('freePlanDescription', { limit: orderLimit })}
                </p>
                <p className="font-medium text-primary">
                  {t('upgradeToPaid', { price: paidTierPrice })}
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {t('paidPlanDescription', { price: paidTierPrice })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
