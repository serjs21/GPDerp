"use client";

import { FetchingStaticLoader } from "@/components/Loaders/FetchingLoader";
import { ManageLabelsPanel } from "@/components/ManageLabel";
import { ShareLinkManagement } from "@/components/ShareLinkManagement";
import { ProfileInfoTab } from "./ProfileInfoTab";
import type { ProfileActiveTabProps } from "./ProfileTabContent.types";

export function ProfileActiveTab({ tab, labelsAccountId, searchQuery, sidePanelTarget }: ProfileActiveTabProps) {
  switch (tab) {
    case "profile":
      return <ProfileInfoTab />;
    case "share-links":
      return <ShareLinkManagement active />;
    case "labels":
      return labelsAccountId ? (
        <ManageLabelsPanel
          accountId={labelsAccountId}
          active
          searchVariant="none"
          searchQuery={searchQuery}
          showCreate
          showSort
          sidePanelTarget={sidePanelTarget}
          loader={<FetchingStaticLoader />}
        />
      ) : null;
  }
}
