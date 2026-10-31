"use client";

import { useTranslations } from "next-intl";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import dialogStyles from "@/components/ComicDialogContent/ComicDialogContent.module.css";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { COMIC_TOAST_TONE_PRESETS } from "@/components/ComicToast";
import type { ErrorFallbackProps } from "./ErrorFallback.types";
import styles from "./ErrorFallback.module.css";

const ERROR_TONE = COMIC_TOAST_TONE_PRESETS.error;

/** Shown by the app error boundary when a page fails to render. */
export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const t = useTranslations("ErrorFallback");
  return (
    <section className={styles.root} role="alert" aria-live="assertive">
      <ComicDialogContent
        bubbleStyle={ERROR_TONE.bubbleStyle}
        backgroundColors={ERROR_TONE.backgroundColors}
        className={dialogStyles.previewStage}
        contentClassName={styles.text}
      >
        {t("message")}
      </ComicDialogContent>
      <ComicPageCtaAction label={t("retry")} onClick={onRetry} />
    </section>
  );
}
