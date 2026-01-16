import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { shopExists } from "../actions/shopify-auth";
import PageLoader from "../components/PageLoader";

export default async function SpecialOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("specialOffers");
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
      <div className="p-6">
        <p>{t('description', { shop })}</p>
      </div>
    </PageLoader>
  );
}

