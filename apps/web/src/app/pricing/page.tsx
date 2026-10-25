import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingPlanCard } from "./components/PricingPlanCard";
import legalStyles from "../terms/terms.module.css";
import styles from "./pricing.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PricingPage");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-static";

export default async function PricingPage() {
  const legal = await getTranslations("LegalPages");
  const t = await getTranslations("PricingPage");

  return (
    <div className={legalStyles.wrap}>
      <div className={legalStyles.panel}>
        <Link href="/" className={legalStyles.back}>
          {legal("back")}
        </Link>
        <article className={legalStyles.prose}>
          <h1>{t("title")}</h1>
          <p>{t("intro")}</p>
          <div className={styles.plans}>
            <PricingPlanCard name={t("free.name")} price={t("free.price")} detail={t("free.detail")} />
            <PricingPlanCard
              name={t("pack.name")}
              price={t("pack.price")}
              priceNote={t("pack.priceNote")}
              detail={t("pack.detail")}
              featured
            />
          </div>
          <h2>{t("notesTitle")}</h2>
          <ul>
            <li>{t("notes.noSubscription")}</li>
            <li>{t("notes.paddle")}</li>
            <li>{t("notes.credits")}</li>
            <li>
              {t.rich("notes.policies", {
                refund: (chunks) => <Link href="/refund">{chunks}</Link>,
                terms: (chunks) => <Link href="/terms">{chunks}</Link>,
              })}
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
