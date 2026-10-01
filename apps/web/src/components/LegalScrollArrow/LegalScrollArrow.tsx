"use client";

import { SITE_FOOTER_ID } from "@/consts/layout/siteFooterConsts";
import { NAVIGATION_ARROW_SRC } from "@/consts/navigation/navigationArrowConsts";
import { useElementVisibleRatio } from "@/hooks/useElementVisibleRatio";
import { LEGAL_SCROLL_ARROW_FOOTER_RATIO } from "./consts/legalScrollArrowConsts";
import styles from "./LegalScrollArrow.module.css";

/** Home page: bottom-left jump between the page and the legal footer. */
export function LegalScrollArrow() {
  const atFooter = useElementVisibleRatio(SITE_FOOTER_ID) >= LEGAL_SCROLL_ARROW_FOOTER_RATIO;

  const onClick = () => {
    window.scrollTo({
      top: atFooter ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={[styles.root, atFooter ? styles.atFooter : ""].filter(Boolean).join(" ")}
      aria-label={atFooter ? "Scroll to top" : "Scroll to legal information"}
      onClick={onClick}
    >
      {atFooter ? null : <span className={styles.caption}>Boring legal stuff</span>}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative arrow from /public */}
      <img className={styles.icon} src={NAVIGATION_ARROW_SRC} alt="" draggable={false} />
    </button>
  );
}
