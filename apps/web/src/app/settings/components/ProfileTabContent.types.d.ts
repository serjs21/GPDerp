import type { ManageLabelsPanelProps } from "@/components/ManageLabel";
import type { ProfilePageTab } from "./ProfileTabs.types";

export type ProfileTabContentProps = {
  tab: ProfilePageTab;
  labelsAccountId: ManageLabelsPanelProps["accountId"] | null | undefined;
  searchQuery: string;
  /** Wide layout on the labels tab: sort/filter render into an aside beside the list. */
  showSidePanel: boolean;
};

export type ProfileActiveTabProps = Pick<ProfileTabContentProps, "tab" | "labelsAccountId" | "searchQuery"> & {
  sidePanelTarget: ManageLabelsPanelProps["sidePanelTarget"];
};
