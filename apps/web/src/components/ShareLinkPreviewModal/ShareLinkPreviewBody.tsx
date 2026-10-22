"use client";

import { useTranslations } from "next-intl";
import { WagTailLanternFace } from "@/components/Loaders";
import { LanternBaseLoaderShell } from "@/components/Loaders/LanternBaseLoaderShell";
import type { ShareLinkPreviewBodyProps } from "./ShareLinkPreviewModal.types";
import { ShareLinkPreviewLantern } from "./ShareLinkPreviewLantern";
import styles from "./ShareLinkPreviewModal.module.css";

/** Shared haiku lantern, a loader while it loads, or an "unavailable" note. */
export function ShareLinkPreviewBody({ subject, haiku, loading, showLabels, onHaikuChanged }: ShareLinkPreviewBodyProps) {
  const t = useTranslations("ShareLinkPreviewModal");

  if (haiku) {
    return (
      <ShareLinkPreviewLantern
        subject={subject}
        haiku={haiku}
        showLabels={showLabels}
        onHaikuChanged={onHaikuChanged}
      />
    );
  }

  if (loading) {
    return (
      <div className={styles.loader}>
        <LanternBaseLoaderShell className={styles.lanternLoader}>
          <WagTailLanternFace caption={t("loading")} />
        </LanternBaseLoaderShell>
      </div>
    );
  }

  return <p className={styles.empty}>{t("unavailable")}</p>;
}
