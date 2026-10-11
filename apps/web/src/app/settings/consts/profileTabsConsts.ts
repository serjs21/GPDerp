import type { ComicPagePanelOptions } from "@/components/ComicPanelTabs";
import type { LabelMethodIconProps } from "@/components/LabelMethodIcon";
import type { ProfilePageTab } from "../components/ProfileTabs.types";

export const PROFILE_TABS: ProfilePageTab[] = ["profile", "share-links", "labels"];

/** Tab panel art + icon per settings tab; `title` / `ariaLabel` are `Profile` message keys. */
export const TAB_META: Record<
  ProfilePageTab,
  {
    title: string;
    background: NonNullable<ComicPagePanelOptions["background"]>;
    color: NonNullable<ComicPagePanelOptions["color"]>;
    ariaLabel: string;
    iconSrc: string;
    bubbleStyle: NonNullable<LabelMethodIconProps["bubbleStyle"]>;
  }
> = {
  profile: {
    title: "title",
    background: "sunburst",
    color: "soviet",
    ariaLabel: "tabs.profile.ariaLabel",
    iconSrc: "/profile/profile.svg",
    bubbleStyle: "square",
  },
  "share-links": {
    title: "tabs.shareLinks.title",
    background: "solid",
    color: "#9d8ccd",
    ariaLabel: "tabs.shareLinks.ariaLabel",
    iconSrc: "/profile/share_link.svg",
    bubbleStyle: "thought",
  },
  labels: {
    title: "tabs.labels.title",
    background: "halftone",
    color: "#4ce8d9",
    ariaLabel: "tabs.labels.ariaLabel",
    iconSrc: "/profile/labels.svg",
    bubbleStyle: "diamond",
  },
};

/** Pending email-change links expire after a day. */
export const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;
