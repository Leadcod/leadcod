import { getTranslations } from "next-intl/server";
import FormBuilderClient from "../components/FormBuilder/FormBuilderClient";
import { getForm } from "../actions/form";
import PageLoader from "../components/PageLoader";

export default async function FormBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("formBuilder");

  const { shop } = await searchParams;
  const existingForm = await getForm(shop);

  return (
    <PageLoader>
      <s-page heading={t('title')} />
      <FormBuilderClient shopUrl={shop} existingForm={existingForm} />
    </PageLoader>
  );
}
