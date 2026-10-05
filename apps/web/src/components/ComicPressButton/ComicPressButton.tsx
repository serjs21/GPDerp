"use client";

import type { ComicPressButtonProps } from "./ComicPressButton.types";
import styles from "./ComicPressButton.module.css";

/** Plain button with a comic ink drop shadow that presses in while held. */
export function ComicPressButton({
  children,
  className,
  type = "button",
  ...rest
}: ComicPressButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className={[styles.button, className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
