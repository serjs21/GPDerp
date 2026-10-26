"use client";

import type { PasswordClapBurstProps } from "./PasswordClapBurst.types";
import { buildPasswordClapStyle } from "./utils/comicPasswordInputUtils";
import styles from "./ComicPasswordInput.module.css";

/** Tinted clap sound effect popped by the show/hide toggle; keyed per click so a new one replaces it. */
export function PasswordClapBurst({ clap, onClapDone }: PasswordClapBurstProps) {
  if (!clap) return null;
  return (
    <span
      key={clap.id}
      className={styles.clap}
      style={buildPasswordClapStyle(clap.placement, clap.color)}
      aria-hidden
      onAnimationEnd={onClapDone}
    />
  );
}
