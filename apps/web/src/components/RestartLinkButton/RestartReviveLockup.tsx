"use client";

import { useTranslations } from "next-intl";
import { RE_EXPIRED_SRC } from "./consts/restartLinkButtonConsts";
import type { RestartReviveLockupProps } from "./RestartLinkButton.types";
import styles from "./RestartLinkButton.module.css";

export function RestartReviveLockup({ lockupRef, bannerRef }: RestartReviveLockupProps) {
  const t = useTranslations("RestartLinkButton");
  return (
    <span ref={lockupRef} className={styles.reviveLockup} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img src={RE_EXPIRED_SRC} alt="" className={styles.reviveEmblem} />
      <span ref={bannerRef} className={styles.reviveBanner}>
        <span className={styles.reviveText}>{t("revive")}</span>
      </span>
    </span>
  );
}
