"use client";

import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import styles from "./page.module.css";

/** Signed-out Main: masthead and the Login / Register lanterns (pricing and policies are linked in the footer). */
export function GuestHome() {
  return (
    <>
      <div className={styles.mastheadSlot}>
        <GoldenAgeTitle />
      </div>
      <CenteredAuthPrompt />
    </>
  );
}
