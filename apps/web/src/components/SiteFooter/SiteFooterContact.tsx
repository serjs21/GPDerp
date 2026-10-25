import { useTranslations } from "next-intl";
import { SUPPORT_EMAIL } from "./consts/siteFooterConsts";
import styles from "./SiteFooter.module.css";

/** Footer corner contact button: highlight-colored illustration with a comic caption, opening a support email. */
export function SiteFooterContact() {
  const t = useTranslations("SiteFooter");
  return (
    <a
      className={styles.contactButton}
      href={`mailto:${SUPPORT_EMAIL}`}
      aria-label={t("contactAriaLabel", { email: SUPPORT_EMAIL })}
      title={SUPPORT_EMAIL}
    >
      <span className={styles.contactIcon} aria-hidden="true" />
      <span className={styles.contactCaption}>{t("contactUs")}</span>
    </a>
  );
}
