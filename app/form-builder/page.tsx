import { getTranslations } from "next-intl/server";
import FormBuilderClient from "../components/FormBuilder/FormBuilderClient";
import { getForm, saveForm } from "../actions/form";
import { DEFAULT_FORM_FIELDS, DEFAULT_GLOBAL_SETTINGS } from "../types/form";

export default async function FormBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ shop: string }>;
}) {
  const t = await getTranslations("formBuilder");

  const { shop } = await searchParams;
  let existingForm = await getForm(shop);

  // If no form exists and we have a shop URL, create and save default form data
  // (without revalidation since this is during render)
  if (!existingForm && shop) {
    await saveForm(shop, { fields: DEFAULT_FORM_FIELDS, globalSettings: DEFAULT_GLOBAL_SETTINGS }, true);
    // Fetch the newly created form
    existingForm = await getForm(shop);
  }

  return (
    <>
      <s-page heading="Form Builder" />
      <FormBuilderClient shopUrl={shop} existingForm={existingForm} />
    </>
  );
}
