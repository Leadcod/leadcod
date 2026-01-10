import { getTranslations } from "next-intl/server";

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
      <div className="p-6">
        <p>Shipping fees settings page for shop: {shop}</p>
      </div>
    </>
  );
}

