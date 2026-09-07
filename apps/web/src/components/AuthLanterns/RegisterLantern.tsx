"use client";

import styles from "./RegisterLantern.module.css";

export type RegisterLanternProps = {
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

/**
 * Mirrored dark comic lantern control with “Register” lettering on the tilted face.
 */
export function RegisterLantern({
  selected = false,
  onClick,
  className,
  disabled = false,
}: RegisterLanternProps) {
  const rootClass = [
    styles.root,
    selected ? styles.selected : styles.idle,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.base} aria-hidden />
      <span className={styles.label}>Register</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={rootClass}
        disabled={disabled}
        aria-label="Register"
        aria-pressed={selected}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={rootClass}
      aria-hidden={disabled || undefined}
      data-selected={selected || undefined}
    >
      {content}
    </div>
  );
}
