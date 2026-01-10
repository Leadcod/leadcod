import { getTranslations } from "next-intl/server";

export default async function SpecialOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("specialOffers");
  const { shop } = await searchParams;

  return (
    <>
      <s-page heading="Special offers" />
      <div className="p-6">
        <p>Special offers settings page for shop: {shop}</p>
      </div>
    </>
  );
}

