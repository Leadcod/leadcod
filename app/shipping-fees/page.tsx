import { getTranslations } from "next-intl/server";
import ShippingFeesClient from "../components/ShippingFees/ShippingFeesClient";
import PageLoader from "../components/PageLoader";

export default async function ShippingFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("shippingFees");
  const { shop } = await searchParams;
  return (
    <PageLoader>
      <s-page heading={t('title')} />
      <ShippingFeesClient shopUrl={shop} />
    </PageLoader>
  );
}

