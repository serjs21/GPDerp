"use client";

import { useTranslations } from "next-intl";
import { LoginLantern } from "./LoginLantern";
import { RegisterLantern } from "./RegisterLantern";
import styles from "./AuthLanternEntry.module.css";

export type AuthLanternEntryProps = {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  className?: string;
  /** Smaller lanterns for cramped slots (e.g. header). */
  compact?: boolean;
};

/**
 * Staggered Login / Register lantern pair that opens the auth gate.
 */
export function AuthLanternEntry({
  onLoginClick,
  onRegisterClick,
  className,
  compact = false,
}: AuthLanternEntryProps) {
  const t = useTranslations("AuthLanterns");
  const rootClass = [styles.root, compact ? styles.compact : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} aria-label={t("entryGroupLabel")}>
      <LoginLantern onClick={onLoginClick} className={styles.login}  />
      <RegisterLantern className={styles.register} onClick={onRegisterClick} />
    </div>
  );
}
