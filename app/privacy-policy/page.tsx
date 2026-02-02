import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Leadcod",
  description: "Leadcod Privacy Policy - How we collect, use, and protect your data.",
};

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("privacyPolicy");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <s-page heading={t("title")} />
      <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <p className="text-muted-foreground text-sm">
          {t("lastUpdated")}: February 2, 2025
        </p>

        <section>
          <h2 className="text-xl font-semibold">{t("introTitle")}</h2>
          <p className="text-muted-foreground">{t("intro")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("dataWeCollectTitle")}</h2>
          <p className="text-muted-foreground mb-4">{t("dataWeCollectIntro")}</p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>{t("dataShop")}</li>
            <li>{t("dataForms")}</li>
            <li>{t("dataShipping")}</li>
            <li>{t("dataOrders")}</li>
            <li>{t("dataPixels")}</li>
            <li>{t("dataSubscription")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("howWeUseTitle")}</h2>
          <p className="text-muted-foreground mb-4">{t("howWeUseIntro")}</p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>{t("useProvide")}</li>
            <li>{t("useProcess")}</li>
            <li>{t("useShipping")}</li>
            <li>{t("useTracking")}</li>
            <li>{t("useBilling")}</li>
            <li>{t("useImprove")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("dataSharingTitle")}</h2>
          <p className="text-muted-foreground mb-4">{t("dataSharingIntro")}</p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>{t("shareShopify")}</li>
            <li>{t("sharePixels")}</li>
            <li>{t("shareLegal")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("dataRetentionTitle")}</h2>
          <p className="text-muted-foreground">{t("dataRetention")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("securityTitle")}</h2>
          <p className="text-muted-foreground">{t("security")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("yourRightsTitle")}</h2>
          <p className="text-muted-foreground mb-4">{t("yourRightsIntro")}</p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>{t("rightAccess")}</li>
            <li>{t("rightCorrection")}</li>
            <li>{t("rightDeletion")}</li>
            <li>{t("rightUninstall")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("cookiesTitle")}</h2>
          <p className="text-muted-foreground">{t("cookies")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("changesTitle")}</h2>
          <p className="text-muted-foreground">{t("changes")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("contactTitle")}</h2>
          <p className="text-muted-foreground">{t("contact")}</p>
        </section>
      </article>
    </div>
  );
}
