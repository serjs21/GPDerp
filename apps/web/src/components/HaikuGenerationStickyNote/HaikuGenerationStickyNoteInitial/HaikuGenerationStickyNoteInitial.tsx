"use client";

import { useEffect } from "react";
import { TextTyping } from "@/components/TextTyping/TextTyping";
import { WashInSea } from "@/components/animations/WashInSea/WashInSea";
import { INITIAL_HAIKU_TEXT, WASH_IN_SEA_DURATION_MS } from "../constants";
import { HaikuGenerationStickyNoteShell } from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import styles from "./HaikuGenerationStickyNoteInitial.module.css";

export type HaikuGenerationStickyNoteInitialProps = {
  washingOut?: boolean;
  onWashedOut?: () => void;
  text?: string;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function HaikuGenerationStickyNoteInitial({
  washingOut = false,
  onWashedOut,
  text = INITIAL_HAIKU_TEXT,
}: HaikuGenerationStickyNoteInitialProps) {
  useEffect(() => {
    if (!washingOut) return;

    if (prefersReducedMotion()) {
      onWashedOut?.();
      return;
    }

    const timer = window.setTimeout(() => {
      onWashedOut?.();
    }, WASH_IN_SEA_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [onWashedOut, washingOut]);

  if (washingOut && prefersReducedMotion()) {
    return null;
  }

  const body =
    washingOut && !prefersReducedMotion() ? (
      <WashInSea direction="down" duration={WASH_IN_SEA_DURATION_MS}>
        <TextTyping text={text} />
      </WashInSea>
    ) : (
      <TextTyping text={text} />
    );

  return (
    <div className={styles.root}>
      <HaikuGenerationStickyNoteShell body={body} rotate={-1.2} />
    </div>
  );
}
