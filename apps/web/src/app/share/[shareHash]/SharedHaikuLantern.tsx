"use client";

import { useMemo, useState, type AnimationEvent } from "react";
import { useTranslations } from "next-intl";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { LabelHalo, toLabelHaloItems } from "@/components/LabelHalo";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SVG_PATH_LANTERN_WIDTH_REM } from "@/components/SVGPath/consts/pathLanternLayoutConsts";
import { useViewportBottomOverlap } from "@/hooks/useViewportBottomOverlap";
import { SHARED_HAIKU_FOOTER_SELECTOR } from "./consts/sharedHaikuCreatedByConsts";
import { SharedHaikuCreatedBy } from "./SharedHaikuCreatedBy";
import type { SharedHaikuLanternProps } from "./SharedHaikuLantern.types";
import { sharedHaikuFlyInStyle } from "./utils/sharedHaikuFlyInUtils";
import { prefersReducedMotionOnceReady, sharedHaikuRootClassName } from "./utils/sharedHaikuMotionUtils";
import styles from "./SharedHaikuLantern.module.css";

export function SharedHaikuLantern({ haiku, showLabels, subject, authorName }: SharedHaikuLanternProps) {
  const t = useTranslations("SharedHaikuPage");
  // App loader overlay hides once auth is initialized — don't play the entrance underneath it.
  const { initialized } = useAuthenticationState();
  const [typed, setTyped] = useState(false);

  // No typing animation under reduced motion, so no `animationend` to wait for.
  const showCreatedBy = typed || prefersReducedMotionOnceReady(initialized);
  const footerOverlap = useViewportBottomOverlap(SHARED_HAIKU_FOOTER_SELECTOR, showCreatedBy);

  // LabelHalo syncs `labels` into state on identity change — keep it stable.
  const labels = useMemo(
    () => (showLabels ? toLabelHaloItems(haiku.labels ?? []) : []),
    [showLabels, haiku.labels],
  );

  // TextTyping chunks render in reveal order — typing is done when the last one finishes.
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (typed) return;
    const chunks = event.currentTarget.querySelectorAll("[data-chunk-number]");
    if (event.target === chunks[chunks.length - 1]) setTyped(true);
  };

  const lantern = (
    <LanternFrame
      ariaLabel={t("lanternAriaLabel", { subject })}
      widthRem={SVG_PATH_LANTERN_WIDTH_REM}
      showLabelBelt={false}
    >
      <Lantern haiku={haiku} showActions={false} typing />
    </LanternFrame>
  );

  return (
    <div
      className={sharedHaikuRootClassName(styles, initialized)}
      style={sharedHaikuFlyInStyle()}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.flyIn}>
        {labels.length > 0 ? (
          <LabelHalo labels={labels} interactive={false} ariaLabel={t("labelsAriaLabel", { subject })}>
            {lantern}
          </LabelHalo>
        ) : (
          lantern
        )}
      </div>
      {showCreatedBy ? <SharedHaikuCreatedBy authorName={authorName} footerOverlap={footerOverlap} /> : null}
    </div>
  );
}
