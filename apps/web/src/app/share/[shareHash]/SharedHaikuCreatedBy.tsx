"use client";

import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import dialogStyles from "@/components/ComicDialogContent/ComicDialogContent.module.css";
import { COMIC_TOAST_TONE_PRESETS } from "@/components/ComicToast";
import { SHARED_HAIKU_CREATED_BY_KEY } from "./consts/sharedHaikuCopyConsts";
import type { SharedHaikuCreatedByProps } from "./SharedHaikuCreatedBy.types";
import { sharedHaikuCreatedByStyle } from "./utils/sharedHaikuCreatedByUtils";
import styles from "./SharedHaikuLantern.module.css";

const SUCCESS_TONE = COMIC_TOAST_TONE_PRESETS.success;

/** "Created by" success bubble portaled to the viewport's bottom-right corner. */
export function SharedHaikuCreatedBy({ authorName, footerOverlap }: SharedHaikuCreatedByProps) {
  const t = useTranslations("SharedHaikuPage");
  return createPortal(
    <div
      className={`${styles.createdBy} magictime puffIn`}
      style={sharedHaikuCreatedByStyle(footerOverlap)}
      role="status"
    >
      <ComicDialogContent
        bubbleStyle={SUCCESS_TONE.bubbleStyle}
        backgroundColors={SUCCESS_TONE.backgroundColors}
        className={[dialogStyles.previewStage, styles.bubbleStage].join(" ")}
        contentClassName={styles.createdByText}
      >
        {t(SHARED_HAIKU_CREATED_BY_KEY, { authorName })}
      </ComicDialogContent>
    </div>,
    document.body,
  );
}
