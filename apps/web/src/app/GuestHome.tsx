"use client";

import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { GuestProductIntro } from "@/components/GuestProductIntro";
import styles from "./page.module.css";

/** Signed-out Main: masthead, the Login / Register lanterns, and what the product is and costs. */
export function GuestHome() {
  return (
    <>
      <div className={styles.mastheadSlot}>
        <GoldenAgeTitle />
      </div>
      <CenteredAuthPrompt />
      <GuestProductIntro />
    </>
  );
}
