import { getTranslations } from "next-intl/server";
import PageLoader from "../components/PageLoader";

export default async function SpecialOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("specialOffers");
  const { shop } = await searchParams;

  return (
    <PageLoader>
      <s-page heading={t('title')} />
      <div className="p-6">
        <p>{t('description', { shop })}</p>
      </div>
    </PageLoader>
  );
}

