"use client";

import { useTranslations } from "next-intl";
import { FILTER_ICON_SRC, HOVER_LABEL, IDLE_LABEL } from "./consts/restartLinkButtonConsts";
import { RestartCharLine } from "./RestartCharLine";
import { RestartHipointsMark } from "./RestartHipointsMark";
import type { RestartButtonFaceProps } from "./RestartLinkButton.types";
import styles from "./RestartLinkButton.module.css";

/** Filter icon + idle label; the used-up variant adds the hipoints mark and the hover label line. */
export function RestartButtonFace({
  reason,
  showHipoints,
  idleFace,
  idleChars,
  hoverChars,
  hipoints,
  filterIcon,
}: RestartButtonFaceProps) {
  const t = useTranslations("RestartLinkButton");
  return (
    <span
      ref={idleFace}
      className={[styles.row, showHipoints ? styles.rowWithHipoints : ""].filter(Boolean).join(" ")}
    >
      <span className={styles.iconCluster}>
        {showHipoints ? <RestartHipointsMark markRef={hipoints} /> : null}
        <span className={styles.iconStage} aria-hidden>
          <span ref={filterIcon} className={styles.filterIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img src={FILTER_ICON_SRC[reason]} alt="" className={styles.filterGlyph} />
          </span>
        </span>
      </span>
      <span className={styles.labelSlot}>
        <RestartCharLine text={t(IDLE_LABEL[reason])} className={styles.labelLine} lineRef={idleChars} />
        {showHipoints ? (
          <RestartCharLine
            text={t(HOVER_LABEL.limit_reached)}
            className={[styles.labelLine, styles.labelLineHover].join(" ")}
            lineRef={hoverChars}
          />
        ) : null}
      </span>
    </span>
  );
}
