"use client";

import { useState } from "react";
import { ComicPageLayout } from "@/components/ComicPageLayout";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useManageLabelsAccount } from "@/hooks/useAccountLabels";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSiteHeaderOverlap } from "@/hooks/useSiteHeaderOverlap";
import { SETTINGS_SIDE_PANEL_QUERY } from "@/consts/settings/settingsLayoutConsts";
import { ProfileProvider } from "./ProfileContext";
import { ProfileTabContent } from "./components/ProfileTabContent";
import { ProfileTabs } from "./components/ProfileTabs";
import { useOwnProfile } from "./hooks/useOwnProfile";
import { useProfileContextValue } from "./hooks/useProfileContextValue";
import { useProfileTab } from "./hooks/useProfileTab";
import { useReportSettingsViewReady } from "./hooks/useReportSettingsViewReady";
import { useSettingsTabArt } from "./hooks/useSettingsTabArt";
import { isProfilePageReady } from "./utils/profileUtils";
import styles from "./profilePage.module.css";

export type { ProfilePageTab } from "./components/ProfileTabs.types";

export default function ProfilePage() {
  const { initialized, isLoggedIn, checkAuthentication } = useAuthenticationState();
  const [pageNode, setPageNode] = useState<HTMLElement | null>(null);
  useSiteHeaderOverlap(pageNode);
  const sidePanelWide = useMediaQuery(SETTINGS_SIDE_PANEL_QUERY);
  const { data: labelsAccountId } = useManageLabelsAccount();
  const { tab, setTab, searchQuery } = useProfileTab();
  const tabArtStatus = useSettingsTabArt(tab);
  useReportSettingsViewReady(pageNode, tab, labelsAccountId);
  const { profile, setProfile, loading } = useOwnProfile(initialized, isLoggedIn);
  const profileContextValue = useProfileContextValue(profile, setProfile, checkAuthentication);

  if (!isProfilePageReady(initialized, isLoggedIn, loading) || !profileContextValue) return null;

  return (
    <main ref={setPageNode} className={styles.page} data-visual-ready={tabArtStatus}>
      <ProfileProvider value={profileContextValue}>
        <ComicPageLayout className={styles.layout}>
          <div className={styles.body}>
            <ProfileTabs tab={tab} onChange={setTab} />
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
