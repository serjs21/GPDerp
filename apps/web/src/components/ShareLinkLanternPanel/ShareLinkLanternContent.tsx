"use client";

import { Lantern } from "@/components/Lantern/Lantern";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { ShareLinkLanternContentProps } from "./ShareLinkLanternPanel.types";
import { shareLinkLanternBodyStyle } from "./utils/lanternPanelTypographyUtils";
import styles from "./ShareLinkLanternPanel.module.css";

/** Saved haiku lantern, a loader while it loads, or a title-only placeholder. */
export function ShareLinkLanternContent({
  subject,
  haiku,
  loading,
  fallbackId,
  createdAt,
}: ShareLinkLanternContentProps) {
  if (haiku) {
    return (
      <Lantern
        haiku={haiku}
        showActions={false}
        bodyOnly
        className={styles.lantern}
        style={shareLinkLanternBodyStyle(haiku.body, haiku.title)}
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

  return (
    <Lantern
      haiku={{
        id: fallbackId,
        title: subject,
        titleSuffix: 0,
        body: "",
        createdAt: createdAt ?? new Date().toISOString(),
        accountId: "",
        createdById: "",
        labels: [],
      }}
      showActions={false}
      bodyOnly
      className={styles.lantern}
    />
  );
}
