"use client";

import styles from "./LoginLantern.module.css";

export type LoginLanternProps = {
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

/**
 * Light comic lantern control with “Login” lettering on the tilted face.
 */
export function LoginLantern({
  selected = false,
  onClick,
  className,
  disabled = false,
}: LoginLanternProps) {
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
      <span className={styles.label}>Login</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={rootClass}
        disabled={disabled}
        aria-label="Login"
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
