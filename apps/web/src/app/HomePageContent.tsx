"use client";

import styles from "./page.module.css";
import { HaikuDisplay } from "@/components/HaikuDisplay";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";

export function HomePageContent() {
  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "baf7a7" },
    body: JSON.stringify({
      sessionId: "baf7a7",
      runId: "pre-fix",
      hypothesisId: "B",
      location: "HomePageContent.tsx:render",
      message: "home page renders nested main",
      data: { isServer: typeof window === "undefined", rendersMain: true },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div className={styles.page}>
      <div className={styles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={styles.main}>
        <CenteredAuthPrompt />
        <HaikuDisplay />
      </main>
    </div>
  );
}
