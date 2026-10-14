"use client";

import dynamic from "next/dynamic";
import { preload } from "react-dom";
import styles from "./page.module.css";
import { loadHaikuDisplay } from "@/components/HaikuDisplay/loadHaikuDisplay";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { AUTH_LANTERN_MASK } from "@/consts/visualReadiness/criticalAssets";

// Members only: guests never download the haiku path, creation flow, or their modals.
const HaikuDisplay = dynamic(loadHaikuDisplay, { ssr: false });

export function HomePageContent() {
  const { initialized, isLoggedIn } = useAuthenticationState();
  // Auth resolves on the client, so the Login/Register lantern mask would otherwise be
  // requested only after the loader is already waiting on it.
  preload(AUTH_LANTERN_MASK.src, { as: "image", crossOrigin: AUTH_LANTERN_MASK.crossOrigin });

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
