"use client";

import { useTranslations } from "next-intl";
import type { LabelBeltNavProps } from "./LabelBelt.types";
import styles from "./LabelBelt.module.css";

const ARROW_SRC = "/lantern/inkbrush-arrow.svg";

/** Previous / next arrows that rotate an overflowing belt. */
export function LabelBeltNav({ disabled, onStep }: LabelBeltNavProps) {
  const t = useTranslations("Lantern.labelBelt");
  return (
    <>
      <button
        type="button"
        className={[styles.navButton, styles.navPrev].join(" ")}
        aria-label={t("previous")}
        disabled={disabled}
        onClick={() => onStep(-1)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
        <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
      </button>
      <button
        type="button"
        className={[styles.navButton, styles.navNext].join(" ")}
        aria-label={t("next")}
        disabled={disabled}
        onClick={() => onStep(1)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
        <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
      </button>
    </>
  );
}
