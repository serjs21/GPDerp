"use client";

import { useMemo, useState, type AnimationEvent } from "react";
import { createPortal } from "react-dom";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import dialogStyles from "@/components/ComicDialogContent/ComicDialogContent.module.css";
import { COMIC_TOAST_TONE_PRESETS } from "@/components/ComicToast";
import { LabelHalo, toLabelHaloItems } from "@/components/LabelHalo";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SVG_PATH_LANTERN_WIDTH_REM } from "@/components/SVGPath/consts/pathLanternLayoutConsts";
import { SHARED_HAIKU_CREATED_BY_PREFIX } from "./consts/sharedHaikuCopyConsts";
import type { SharedHaikuLanternProps } from "./SharedHaikuLantern.types";
import { sharedHaikuFlyInStyle } from "./utils/sharedHaikuFlyInUtils";
import styles from "./SharedHaikuLantern.module.css";

const SUCCESS_TONE = COMIC_TOAST_TONE_PRESETS.success;

export function SharedHaikuLantern({ haiku, showLabels, subject, authorName }: SharedHaikuLanternProps) {
  // App loader overlay hides once auth is initialized — don't play the entrance underneath it.
  const { initialized } = useAuthenticationState();
  const [typed, setTyped] = useState(false);

  // No typing animation under reduced motion, so no `animationend` to wait for.
  // `initialized` is false on the server and at hydration, so `window` is only read client-side.
  const reducedMotion =
    initialized && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showCreatedBy = typed || reducedMotion;

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
      ariaLabel={`Haiku lantern: ${subject}`}
      widthRem={SVG_PATH_LANTERN_WIDTH_REM}
      showLabelBelt={false}
    >
      <Lantern haiku={haiku} showActions={false} typing />
    </LanternFrame>
  );

  return (
    <div
      className={[styles.root, initialized && styles.animate].filter(Boolean).join(" ")}
      style={sharedHaikuFlyInStyle()}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.flyIn}>
        {labels.length > 0 ? (
          <LabelHalo labels={labels} interactive={false} ariaLabel={`${subject} labels`}>
            {lantern}
          </LabelHalo>
        ) : (
          lantern
        )}
      </div>
      {showCreatedBy
        ? createPortal(
            <div className={`${styles.createdBy} magictime puffIn`} role="status">
              <ComicDialogContent
                bubbleStyle={SUCCESS_TONE.bubbleStyle}
                backgroundColors={SUCCESS_TONE.backgroundColors}
                className={[dialogStyles.previewStage, styles.bubbleStage].join(" ")}
                contentClassName={styles.createdByText}
              >
                {SHARED_HAIKU_CREATED_BY_PREFIX} {authorName}
              </ComicDialogContent>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
