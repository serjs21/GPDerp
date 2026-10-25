import Link from "next/link";
import { useTranslations } from "next-intl";
import { SUPPORT_EMAIL } from "@/consts/contact/contactConsts";
import type { GuestProductIntroProps } from "./GuestProductIntro.types";
import styles from "./GuestProductIntro.module.css";

/**
 * What GPDerp is and what it costs, for signed-out visitors (and payment-provider reviewers):
 * without it the home page is only the Login / Register lanterns. Plain markup, so it also renders
 * from the server HTML (used in the home page's `<noscript>` fallback).
 */
export function GuestProductIntro({ className }: GuestProductIntroProps) {
  const t = useTranslations("GuestProductIntro");
  const footer = useTranslations("SiteFooter");

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={t("ariaLabel")}>
      <p className={styles.summary}>{t("summary")}</p>
      <nav className={styles.links} aria-label={t("linksAriaLabel")}>
        <Link href="/pricing">{footer("pricing")}</Link>
        <Link href="/terms">{footer("terms")}</Link>
        <Link href="/refund">{footer("refund")}</Link>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </nav>
    </section>
  );
}
