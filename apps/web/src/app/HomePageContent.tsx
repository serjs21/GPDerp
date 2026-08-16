"use client";

import styles from "./page.module.css";
import { HaikuDisplay } from "@/components/HaikuDisplay";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";

export function HomePageContent() {
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
