import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import PlansClient from "../components/Plans/PlansClient";
import { shopExists } from "@/app/actions/shopify-auth";
import { getPlanInfo } from "@/app/actions/plan";
import PageLoader from "../components/PageLoader";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("plans");
  const { shop } = await searchParams;
  
  // Check if shop exists, redirect to onboarding if not
  if (!shop) {
    redirect('/');
  }
  
  const exists = await shopExists(shop);
  if (!exists) {
    redirect('/');
  }

  // Load plan info on the server
  const planInfo = await getPlanInfo(shop);

  return (
    <PageLoader>
      <s-page heading={t("title")} />
      <PlansClient shopUrl={shop} initialPlanInfo={planInfo} />
    </PageLoader>
  );
}
