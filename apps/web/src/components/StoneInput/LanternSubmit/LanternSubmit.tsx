"use client";

import styles from "./LanternSubmit.module.css";

export type LanternSubmitProps = {
  disabled?: boolean;
  /** When true and not disabled, show flame (submittable). */
  active?: boolean;
  "aria-label"?: string;
  className?: string;
  type?: "submit" | "button";
};

export function LanternSubmit({
  disabled = false,
  active = false,
  "aria-label": ariaLabel = "詠む Compose",
  className,
  type = "submit",
}: LanternSubmitProps) {
  const showFlame = active && !disabled;
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={rootClass}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      <span className={styles.icon} aria-hidden />
      {showFlame ? <span className={styles.flame} aria-hidden /> : null}
    </button>
  );
}
