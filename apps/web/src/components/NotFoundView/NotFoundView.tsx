"use client";

import { useTranslations } from "next-intl";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AwkwardLantern } from "@/components/AwkwardLantern";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import dialogStyles from "@/components/ComicDialogContent/ComicDialogContent.module.css";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { COMIC_TOAST_TONE_PRESETS } from "@/components/ComicToast";
import {
  NOT_FOUND_COPY,
  NOT_FOUND_SIGN_UP_COPY,
  NOT_FOUND_TOAST_COPY,
} from "./consts/notFoundViewConsts";
import type { NotFoundViewProps } from "./NotFoundView.types";
import { notFoundFlyInStyle } from "./utils/notFoundFlyInUtils";
import styles from "./NotFoundView.module.css";

const INFO_TONE = COMIC_TOAST_TONE_PRESETS.info;
const SUCCESS_TONE = COMIC_TOAST_TONE_PRESETS.success;

export function NotFoundView({ className }: NotFoundViewProps) {
  const t = useTranslations("NotFoundView");
  const { initialized, isLoggedIn } = useAuthenticationState();
  const { openAuthenticationModal } = useAuthenticationVerification();

  return (
    <section
      className={[styles.root, initialized && styles.animate, className].filter(Boolean).join(" ")}
      style={notFoundFlyInStyle()}
      aria-labelledby="not-found-copy"
    >
      <div className={styles.stack}>
        <div
          className={[styles.toast, initialized && "magictime puffIn"].filter(Boolean).join(" ")}
          role="status"
        >
          <ComicDialogContent
            bubbleStyle={SUCCESS_TONE.bubbleStyle}
            backgroundColors={SUCCESS_TONE.backgroundColors}
            className={[dialogStyles.previewStage, styles.bubbleStage].join(" ")}
            contentClassName={styles.toastText}
          >
            {t(NOT_FOUND_TOAST_COPY)}
          </ComicDialogContent>
        </div>
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
            <span id="not-found-copy">{t(NOT_FOUND_COPY)}</span>
          </ComicDialogContent>
        </div>
        {initialized && !isLoggedIn ? (
          <div className={styles.signUp}>
            <ComicPageCtaAction
              label={t(NOT_FOUND_SIGN_UP_COPY)}
              onClick={() => openAuthenticationModal("register")}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
