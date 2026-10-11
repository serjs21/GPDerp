export type ProfilePageTab = "profile" | "share-links" | "labels";

export type ProfileTabsProps = {
  tab: ProfilePageTab;
  onChange: (next: ProfilePageTab) => void;
};
