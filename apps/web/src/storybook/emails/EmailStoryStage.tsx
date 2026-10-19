"use client";

import type { EmailStoryStageProps } from "./EmailStoryStage.types";
import { ResolvedGmailEmail } from "./ResolvedGmailEmail";
import styles from "./EmailStoryStage.module.css";

/** Picks one email from the loader result; explains what is missing when the API is not reachable. */
export function EmailStoryStage({ result, emailId, viewport, tab }: EmailStoryStageProps) {
  if (!result) return <p className={styles.notice}>Loading emails…</p>;
  if (!result.ok) return <p className={styles.error}>{result.error}</p>;

  const email = result.emails.find((item) => item.id === emailId);
  if (!email) return <p className={styles.error}>The API returned no email with id “{emailId}”.</p>;

  return (
    <div className={styles.stage}>
      <ResolvedGmailEmail email={email} viewport={viewport} defaultTab={tab} />
    </div>
  );
}
