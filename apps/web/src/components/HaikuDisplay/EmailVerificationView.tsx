"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { SVGPath } from "@/components/SVGPath";
import { useEmailVerificationRecheck } from "@/hooks/useEmailVerificationRecheck";
import { useFooterClearance } from "@/hooks/useFooterClearance";
import { useResendVerificationEmail } from "@/hooks/useResendVerificationEmail";
import { verificationCtaStyle } from "./utils/verificationCtaUtils";
import styles from "./HaikuDisplay.module.css";

const NO_HAIKUS: [] = [];

/** Main for a signed-in user whose email isn't verified: the verification lantern and a resend CTA, no input. */
export function EmailVerificationView() {
  const t = useTranslations("EmailVerificationView");
  const { sending, send } = useResendVerificationEmail();
  useEmailVerificationRecheck(true);
  const footerClearancePx = useFooterClearance(true);

  return (
    <div className={styles.wrapper}>
      <div className={styles.displayArea}>
        <SVGPath haikus={NO_HAIKUS} emptyPlaceholder="verifyEmail" />
      </div>
      <div className={styles.verificationCta} style={verificationCtaStyle(footerClearancePx)}>
        <ComicPageCtaAction label={t("send")} busy={sending} onClick={() => void send()} />
      </div>
    </div>
  );
}
