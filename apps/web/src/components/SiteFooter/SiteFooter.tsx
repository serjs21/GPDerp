import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./SiteFooter.module.css";

const PADDLE_BUYER_TERMS = "https://www.paddle.com/legal/checkout-buyer-terms";
const PADDLE_PRIVACY = "https://www.paddle.com/legal/privacy";
const PADDLE_REFUND = "https://www.paddle.com/legal/refund-policy";

function Sep() {
  return <span className={styles.sep} aria-hidden="true">·</span>;
}

export function SiteFooter() {
  const t = useTranslations("SiteFooter");
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label={t("legalPolicies")}>
        <Link href="/terms">{t("terms")}</Link>
        <Sep />
        <Link href="/privacy">{t("privacy")}</Link>
        <Sep />
        <Link href="/refund">{t("refund")}</Link>
        <Sep />
        <Link href="/acceptable-use">{t("acceptableUse")}</Link>
        <Sep />
        <Link href="/cookies">{t("cookies")}</Link>
      </nav>
      <p className={styles.paddle}>
        {t.rich("paddleNotice", {
          buyerTerms: (chunks) => (
            <a href={PADDLE_BUYER_TERMS} target="_blank" rel="noopener noreferrer">
              {chunks}
            </a>
          ),
          refund: (chunks) => (
            <a href={PADDLE_REFUND} target="_blank" rel="noopener noreferrer">
              {chunks}
            </a>
          ),
          checkout: (chunks) => (
            <a href={PADDLE_BUYER_TERMS} target="_blank" rel="noopener noreferrer">
              {chunks}
            </a>
          ),
          privacy: (chunks) => (
            <a href={PADDLE_PRIVACY} target="_blank" rel="noopener noreferrer">
              {chunks}
            </a>
          ),
        })}
      </p>
    </footer>
  );
}
