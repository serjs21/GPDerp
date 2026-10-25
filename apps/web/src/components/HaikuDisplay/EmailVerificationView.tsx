"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { SVGPath } from "@/components/SVGPath";
import { useEmailVerificationRecheck } from "@/hooks/useEmailVerificationRecheck";
import { useResendVerificationEmail } from "@/hooks/useResendVerificationEmail";
import styles from "./HaikuDisplay.module.css";

const NO_HAIKUS: [] = [];

/** Main for a signed-in user whose email isn't verified: the verification lantern with a resend CTA under it, no input. */
export function EmailVerificationView() {
  const t = useTranslations("EmailVerificationView");
  const { sending, send } = useResendVerificationEmail();
  useEmailVerificationRecheck(true);

  return (
    <div className={styles.wrapper}>
      <div className={styles.displayArea}>
        <SVGPath
          haikus={NO_HAIKUS}
          emptyPlaceholder="verifyEmail"
          emptyPlaceholderAction={<ComicPageCtaAction label={t("send")} busy={sending} onClick={() => void send()} />}
        />
      </div>
    </div>
  );
}
