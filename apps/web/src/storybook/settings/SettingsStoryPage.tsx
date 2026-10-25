"use client";

import { useState } from "react";
import { ProfileTabContent } from "@/app/settings/components/ProfileTabContent";
import { ProfileTabs } from "@/app/settings/components/ProfileTabs";
import { ProfileProvider, type ProfileContextValue } from "@/app/settings/ProfileContext";
import styles from "@/app/settings/profilePage.module.css";
import { ComicPageLayout } from "@/components/ComicPageLayout";
import { SETTINGS_SIDE_PANEL_QUERY } from "@/consts/settings/settingsLayoutConsts";
import { useManageLabelsAccount } from "@/hooks/useAccountLabels";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSiteHeaderOverlap } from "@/hooks/useSiteHeaderOverlap";
import { STORY_LOGGED_IN_USER } from "../fixtures/loggedInUser";
import type { SettingsStoryPageProps } from "./SettingsStoryPage.types";

const STORY_PROFILE: ProfileContextValue = {
  displayName: STORY_LOGGED_IN_USER.userName ?? "",
  avatarUrl: STORY_LOGGED_IN_USER.avatar,
  email: STORY_LOGGED_IN_USER.email,
  firstName: STORY_LOGGED_IN_USER.firstName,
  lastName: STORY_LOGGED_IN_USER.lastName,
  nickname: STORY_LOGGED_IN_USER.userName ?? "",
  saving: false,
  savingAvatar: false,
  saveProfileLabel: "Save profile",
  onSaveProfile: async () => undefined,
  onAvatarUploaded: () => undefined,
};

/**
 * Settings page layout (same frame, tabs and tab content as app/settings/page.tsx) with a static profile.
 * The real page refetches its profile on every render in Storybook: its theme/locale setters are only
 * stable under the React Compiler, which the Storybook build does not run.
 */
export function SettingsStoryPage({ tab, searchQuery = "" }: SettingsStoryPageProps) {
  const [pageNode, setPageNode] = useState<HTMLElement | null>(null);
  useSiteHeaderOverlap(pageNode);
  const sidePanelWide = useMediaQuery(SETTINGS_SIDE_PANEL_QUERY);
  const { data: labelsAccountId } = useManageLabelsAccount();

  return (
    <main ref={setPageNode} className={styles.page}>
      <ProfileProvider value={STORY_PROFILE}>
        <ComicPageLayout className={styles.layout}>
          <div className={styles.body}>
            <ProfileTabs tab={tab} onChange={() => undefined} />
            <ProfileTabContent
              tab={tab}
              labelsAccountId={labelsAccountId}
              searchQuery={searchQuery}
              showSidePanel={sidePanelWide && tab === "labels"}
            />
          </div>
        </ComicPageLayout>
      </ProfileProvider>
    </main>
  );
}
