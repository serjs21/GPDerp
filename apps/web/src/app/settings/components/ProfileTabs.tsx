"use client";

import { useTranslations } from "next-intl";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { PROFILE_TABS, TAB_META } from "../consts/profileTabsConsts";
import type { ProfileTabsProps } from "./ProfileTabs.types";
import styles from "../profilePage.module.css";

/** Comic panel tab row (profile / share links / labels). */
export function ProfileTabs({ tab, onChange }: ProfileTabsProps) {
  const t = useTranslations("Profile");
  return (
    <ComicPanelTabs
      className={styles.tabRow}
      panelClassName={styles.tabPanel}
      value={tab}
      onChange={onChange}
      tabs={PROFILE_TABS.map((id) => {
        const meta = TAB_META[id];
        return {
          id,
          panel: {
            title: t(meta.title),
            background: meta.background,
            color: meta.color,
            ariaLabel: t(meta.ariaLabel),
          },
          content: (
            <LabelMethodIcon
              src={meta.iconSrc}
              bubbleStyle={meta.bubbleStyle}
              sourceDirection="none"
              active={tab === id}
            />
          ),
        };
      })}
    />
  );
}
