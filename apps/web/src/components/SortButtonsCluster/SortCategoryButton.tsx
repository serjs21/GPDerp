"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./SortCategoryButton.module.css";

export type SortCategoryButtonProps = {
  startIcon: ReactNode;
  endIcon: ReactNode;
  label?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  "aria-label"?: string;
};

export function SortCategoryButton({
  startIcon,
  endIcon,
  label,
  selected = false,
  disabled = false,
  className,
  onClick,
  "aria-label": ariaLabel,
}: SortCategoryButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, selected ? styles.selected : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.icon} aria-hidden>
        {startIcon}
      </span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.icon} aria-hidden>
        {endIcon}
      </span>
    </button>
  );
}
