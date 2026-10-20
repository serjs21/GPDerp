"use client";

import { useTranslations } from "next-intl";
import { ComicPageLayout } from "@/components/ComicPageLayout";
import { EmailChangeRevertConfirm } from "./EmailChangeRevertConfirm";
import { EmailChangeRevertPasswordStep } from "./EmailChangeRevertPasswordStep";
import { EmailChangeRevertResult } from "./EmailChangeRevertResult";
import type { EmailChangeRevertViewProps } from "./EmailChangeRevertView.types";
import styles from "./EmailChangeRevertView.module.css";

/** Comic-page flow behind the "undo the change" link in the old-address alert. */
export function EmailChangeRevertView({ state, onConfirm, onKeep, onSubmitPassword, onSignIn }: EmailChangeRevertViewProps) {
  const t = useTranslations("EmailChangeRevert");

  return (
    <section className={styles.root}>
      <ComicPageLayout title={t("pageTitle")} className={styles.page}>
        {state.kind === "confirm" ? (
          <EmailChangeRevertConfirm {...state} onConfirm={onConfirm} onKeep={onKeep} />
        ) : state.kind === "setPassword" ? (
          <EmailChangeRevertPasswordStep {...state} onSubmitPassword={onSubmitPassword} />
        ) : (
          <EmailChangeRevertResult state={state} onKeep={onKeep} onSignIn={onSignIn} />
        )}
      </ComicPageLayout>
    </section>
  );
}
