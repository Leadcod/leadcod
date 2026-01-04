import { getTranslations } from "next-intl/server";

export default async function FormBuilder() {
  const t = await getTranslations("formBuilder");
  return (
    <s-page heading="Form Builder">

        { /* Form Builder */ }
        <s-box slot="content">
            <s-section>
                <s-stack gap='base large-500' direction="inline">
                    <s-paragraph>lotfi</s-paragraph>
                    <s-paragraph>lotfi</s-paragraph>
                    <s-paragraph>lotfi</s-paragraph>
                </s-stack>
            </s-section>
        </s-box>


        { /* Form Preview*/ }
        <s-box slot="aside">
            <s-section>
                {t("title")}
            </s-section>
        </s-box>
    </s-page>
  );
}