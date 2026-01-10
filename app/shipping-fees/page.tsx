import { getTranslations } from "next-intl/server";
import ShippingFeesClient from "../components/ShippingFees/ShippingFeesClient";

export default async function ShippingFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("shippingFees");
  const { shop } = await searchParams;

  return (
    <>
      <s-page heading="Shipping fees" />
      <ShippingFeesClient shopUrl={shop} />
    </>
  );
}

