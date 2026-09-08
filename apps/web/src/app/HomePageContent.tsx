"use client";

import styles from "./page.module.css";
import { HaikuDisplay } from "@/components/HaikuDisplay";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";

export function HomePageContent() {
  const { initialized, isLoggedIn } = useAuthenticationState();

  return (
    <div className={styles.page}>
      <div className={styles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={styles.main}>
        {initialized && !isLoggedIn ? (
          <div className={styles.mastheadSlot}>
            <GoldenAgeTitle />
          </div>
        ) : null}
        <CenteredAuthPrompt />
        {initialized && isLoggedIn ? <HaikuDisplay /> : null}
      </main>
    </div>
  );
}
