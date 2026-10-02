"use client";

import { AwkwardLantern } from "@/components/AwkwardLantern";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import dialogStyles from "@/components/ComicDialogContent/ComicDialogContent.module.css";
import { COMIC_TOAST_TONE_PRESETS } from "@/components/ComicToast";
import { NOT_FOUND_COPY } from "./consts/notFoundViewConsts";
import type { NotFoundViewProps } from "./NotFoundView.types";
import { notFoundFlyInStyle } from "./utils/notFoundFlyInUtils";
import styles from "./NotFoundView.module.css";

const INFO_TONE = COMIC_TOAST_TONE_PRESETS.info;

export function NotFoundView({ className }: NotFoundViewProps) {
  return (
    <section
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={notFoundFlyInStyle()}
      aria-labelledby="not-found-copy"
    >
      <div className={styles.flyIn}>
        <AwkwardLantern />
      </div>
      <div className={styles.copy}>
        <ComicDialogContent
          bubbleStyle={INFO_TONE.bubbleStyle}
          backgroundColors={INFO_TONE.backgroundColors}
          className={[dialogStyles.previewStage, styles.bubbleStage].join(" ")}
          contentClassName={styles.text}
        >
          <span id="not-found-copy">{NOT_FOUND_COPY}</span>
        </ComicDialogContent>
      </div>
    </section>
  );
}
