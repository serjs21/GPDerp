"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction, ComicPagePanel } from "@/components/ComicPageLayout";
import { EMAIL_CHANGE_REVERT_RESULT_COPY } from "./consts/emailChangeRevertConsts";
import type { EmailChangeRevertResultProps } from "./EmailChangeRevertResult.types";
import { EmailChangeRevertSuccessRow } from "./EmailChangeRevertSuccessRow";
import { resultActionLabelKey, resultBodyKey, resultEmail, resultPanelView } from "./utils/emailChangeRevertCopyUtils";
import styles from "./EmailChangeRevertView.module.css";

/** Loading, finished and broken-link states: one panel and at most one way forward. */
export function EmailChangeRevertResult({ state, onKeep, onSignIn }: EmailChangeRevertResultProps) {
  const t = useTranslations("EmailChangeRevert");
  const copy = EMAIL_CHANGE_REVERT_RESULT_COPY[state.kind];
  const success = Boolean(copy.success);

  const panel = (
    <ComicPagePanel title={t(copy.title)} titleColor="white" color={copy.panelColor} {...resultPanelView(state, success)}>
      <div className={styles.copy} aria-live="polite">
        <p className={styles.lead}>{t(resultBodyKey(state, copy.body), { email: resultEmail(state) })}</p>
      </div>
    </ComicPagePanel>
  );

  return (
    <>
      {success ? <EmailChangeRevertSuccessRow>{panel}</EmailChangeRevertSuccessRow> : panel}
      {copy.action ? (
        <div className={styles.actions}>
          <ComicPageCtaAction
            label={t(resultActionLabelKey(copy.action))}
            onClick={copy.action === "signIn" ? onSignIn : onKeep}
          />
        </div>
      ) : null}
    </>
  );
}
