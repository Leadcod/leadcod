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
      <s-page heading={t('title')} />
      <div className="p-6">
        <p>{t('description', { shop })}</p>
      </div>
    </>
  );
}

