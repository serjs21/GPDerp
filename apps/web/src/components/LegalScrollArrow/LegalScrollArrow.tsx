"use client";

import { NAVIGATION_ARROW_SRC } from "@/consts/navigation/navigationArrowConsts";
import { useVisibleHeight } from "@/hooks/useVisibleHeight";
import type { LegalScrollArrowProps } from "./LegalScrollArrow.types";
import { legalScrollArrowStyle } from "./utils/legalScrollArrowStyleUtils";
import styles from "./LegalScrollArrow.module.css";

/** Bottom-left jump between the page and the legal footer. */
export function LegalScrollArrow({ footerRef }: LegalScrollArrowProps) {
  const footerVisibleHeight = useVisibleHeight(footerRef);
  const atFooter = footerVisibleHeight > 0;

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
      style={legalScrollArrowStyle(footerVisibleHeight)}
      aria-label={atFooter ? "Scroll to top" : "Scroll to legal information"}
      onClick={onClick}
    >
      {atFooter ? null : <span className={styles.caption}>Boring legal stuff</span>}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative arrow from /public */}
      <img className={styles.icon} src={NAVIGATION_ARROW_SRC} alt="" draggable={false} />
    </button>
  );
}
