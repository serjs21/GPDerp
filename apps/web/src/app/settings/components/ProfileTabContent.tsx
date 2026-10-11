"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProfileActiveTab } from "./ProfileActiveTab";
import type { ProfileTabContentProps } from "./ProfileTabContent.types";
import styles from "../profilePage.module.css";

/** Active tab body, plus the sort/filter aside the labels list portals into on wide layouts. */
export function ProfileTabContent({ tab, labelsAccountId, searchQuery, showSidePanel }: ProfileTabContentProps) {
  const t = useTranslations("Profile");
  const [sideNode, setSideNode] = useState<HTMLElement | null>(null);

  return (
    <div className={[styles.contentSlot, showSidePanel ? styles.contentSlotWithSide : ""].filter(Boolean).join(" ")}>
      <ProfileActiveTab
        tab={tab}
        labelsAccountId={labelsAccountId}
        searchQuery={searchQuery}
        sidePanelTarget={showSidePanel ? sideNode : null}
      />
      {showSidePanel ? <aside ref={setSideNode} className={styles.sidePanel} aria-label={t("sortAndFilter")} /> : null}
    </div>
  );
}
