import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import ShippingFeesClient from "../components/ShippingFees/ShippingFeesClient";
import { shopExists } from "../actions/shopify-auth";
import PageLoader from "../components/PageLoader";

export default async function ShippingFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("shippingFees");
  const { shop } = await searchParams;
  
  // Check if shop exists, redirect to onboarding if not
  if (!shop) {
    redirect('/');
  }
  
  const exists = await shopExists(shop);
  if (!exists) {
    redirect('/');
  }
  return (
    <PageLoader>
      <s-page heading={t('title')} />
      <ShippingFeesClient shopUrl={shop} />
    </PageLoader>
  );
}

