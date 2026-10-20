"use client";

import { useTranslations } from "next-intl";
import { AuthField } from "@/components/AuthFlows/AuthFlowChrome";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPageCtaAction, ComicPagePanel } from "@/components/ComicPageLayout";
import type { EmailChangeRevertPasswordStepProps } from "./EmailChangeRevertPasswordStep.types";
import { useRevertPasswordForm } from "./useRevertPasswordForm";
import styles from "./EmailChangeRevertView.module.css";

/** Forced right after the revert: the old password no longer works, so the owner picks a new one. */
export function EmailChangeRevertPasswordStep({
  restoredEmail,
  emailTaken,
  busy,
  error,
  onSubmitPassword,
}: EmailChangeRevertPasswordStepProps) {
  const t = useTranslations("EmailChangeRevert");
  const form = useRevertPasswordForm(onSubmitPassword);
  const shownError = form.localError ?? error;

  return (
    <>
      <ComicPagePanel
        title={t("revertedCaption")}
        background="solid"
        color="green"
        className={styles.stackPanel}
      >
        <div className={styles.copy}>
          <p className={styles.lead}>
            {emailTaken ? t("emailTakenLead", { email: restoredEmail }) : t("setPasswordLead", { email: restoredEmail })}
          </p>
          <p className={styles.note}>{t("setPasswordNote")}</p>
        </div>
      </ComicPagePanel>
      <ComicPagePanel background="solid" color="white" className={styles.stackPanel}>
        <form className={styles.form} onSubmit={form.onFormSubmit} noValidate>
          <AuthField>
            <ComicModalInput
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => form.changePassword(event.target.value)}
              placeholder={t("newPasswordPlaceholder")}
              aria-label={t("newPasswordPlaceholder")}
            />
          </AuthField>
          <AuthField>
            <ComicModalInput
              type="password"
              name="confirm"
              autoComplete="new-password"
              value={form.confirmation}
              onChange={(event) => form.changeConfirmation(event.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
              aria-label={t("confirmPasswordPlaceholder")}
            />
          </AuthField>
          {shownError ? (
            <p className={styles.error} role="alert">
              {shownError}
            </p>
          ) : null}
        </form>
      </ComicPagePanel>
      <div className={styles.actions}>
        <ComicPageCtaAction label={t("setPasswordCta")} type="submit" busy={busy} onClick={form.submit} />
      </div>
    </>
  );
}
