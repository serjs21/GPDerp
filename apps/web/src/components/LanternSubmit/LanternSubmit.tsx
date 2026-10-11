"use client";

import { useTranslations } from "next-intl";
import { withDefaults } from "@/utils/props/withDefaults";
import styles from "./LanternSubmit.module.css";

export type LanternSubmitProps = {
  disabled?: boolean;
  /** When true and not disabled, show flame (submittable). */
  active?: boolean;
  "aria-label"?: string;
  className?: string;
  type?: "submit" | "button";
};

const LANTERN_SUBMIT_DEFAULTS = {
  disabled: false,
  active: false,
  type: "submit",
} as const;

export function LanternSubmit(props: LanternSubmitProps) {
  const { disabled, active, type, className } = withDefaults(props, LANTERN_SUBMIT_DEFAULTS);
  const t = useTranslations("LanternSubmit");
  const showFlame = active && !disabled;
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={rootClass}
      disabled={disabled}
      aria-label={props["aria-label"] ?? t("ariaLabel")}
      aria-disabled={disabled}
    >
      <span className={styles.icon} aria-hidden />
      {showFlame ? <span className={styles.flame} aria-hidden /> : null}
    </button>
  );
}
