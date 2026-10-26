"use client";

import type { PasswordClapBurstsProps } from "./PasswordClapBursts.types";
import { buildPasswordClapStyle } from "./utils/comicPasswordInputUtils";
import styles from "./ComicPasswordInput.module.css";

/** Tinted clap sound effects popped by the show/hide toggle; each removes itself after fading. */
export function PasswordClapBursts({ claps, onClapDone }: PasswordClapBurstsProps) {
  return claps.map((clap) => (
    <span
      key={clap.id}
      className={styles.clap}
      style={buildPasswordClapStyle(clap.placement, clap.color)}
      aria-hidden
      onAnimationEnd={() => onClapDone(clap.id)}
    />
  ));
}
