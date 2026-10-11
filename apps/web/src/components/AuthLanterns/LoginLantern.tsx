"use client";

import { useTranslations } from "next-intl";
import { withDefaults } from "@/utils/props/withDefaults";
import styles from "./LoginLantern.module.css";

export type LoginLanternProps = {
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

const LOGIN_LANTERN_DEFAULTS = { selected: false, disabled: false };

/**
 * Light comic lantern control with “Login” lettering on the tilted face.
 */
export function LoginLantern(props: LoginLanternProps) {
  const { selected, disabled, className } = withDefaults(props, LOGIN_LANTERN_DEFAULTS);
  const { onClick } = props;
  const t = useTranslations("AuthLanterns");
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
      <span className={styles.label}>{t("login")}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={rootClass}
        disabled={disabled}
        aria-label={t("login")}
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
