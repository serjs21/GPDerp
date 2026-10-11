"use client";

import { useTranslations } from "next-intl";
import { SakuraPetalLoader } from "@/components/Loaders";
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
        <SakuraPetalLoader />
      </div>
    );
  }

  return <p className={styles.empty}>{t("unavailable")}</p>;
}
