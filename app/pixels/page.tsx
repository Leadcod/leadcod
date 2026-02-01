import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import PixelsClient from '../components/Pixels/PixelsClient';
import { shopExists } from '@/app/actions/shopify-auth';
import PageLoader from '../components/PageLoader';

export default async function PixelsPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations('pixels');
  const { shop } = await searchParams;

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
      <PixelsClient shopUrl={shop} />
    </PageLoader>
  );
}
