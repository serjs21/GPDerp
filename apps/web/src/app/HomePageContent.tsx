"use client";

import styles from "./page.module.css";
import { HaikuDisplay } from "@/components/HaikuDisplay";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";

export function HomePageContent() {
  const { initialized, isLoggedIn } = useAuthenticationState();

  return (
    <div className={styles.page}>
      <div className={styles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={styles.main}>
        <CenteredAuthPrompt />
        {initialized && isLoggedIn ? <HaikuDisplay /> : null}
      </main>
    </div>
  );
}
