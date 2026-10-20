"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction, ComicPagePanel } from "@/components/ComicPageLayout";
import { EMAIL_CHANGE_REVERT_RESULT_COPY } from "./consts/emailChangeRevertConsts";
import type { EmailChangeRevertResultProps } from "./EmailChangeRevertResult.types";
import { resultBodyKey, resultEmail } from "./utils/emailChangeRevertCopyUtils";
import styles from "./EmailChangeRevertView.module.css";

/** Loading, finished and broken-link states: one panel and at most one way forward. */
export function EmailChangeRevertResult({ state, onKeep, onSignIn }: EmailChangeRevertResultProps) {
  const t = useTranslations("EmailChangeRevert");
  const copy = EMAIL_CHANGE_REVERT_RESULT_COPY[state.kind];
  const values = { email: resultEmail(state) };

  return (
    <>
      <ComicPagePanel
        title={t(copy.title)}
        titleColor="white"
        background={state.kind === "loading" ? "motion" : "solid"}
        color={copy.panelColor}
        loading={state.kind === "loading"}
        className={styles.stackPanel}
      >
        <div className={styles.copy} aria-live="polite">
          <p className={styles.lead}>{t(resultBodyKey(state, copy.body), values)}</p>
        </div>
      </ComicPagePanel>
      {copy.action ? (
        <div className={styles.actions}>
          <ComicPageCtaAction
            label={t(copy.action === "signIn" ? "signInCta" : "homeCta")}
            onClick={copy.action === "signIn" ? onSignIn : onKeep}
          />
        </div>
      ) : null}
    </>
  );
}
