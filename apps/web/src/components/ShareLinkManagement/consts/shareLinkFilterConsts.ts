import type { ShareLinkFilter } from "@/api/shareLinks";
import type { ComicPanelColor } from "@/components/ComicPageLayout";

export const SHARE_LINK_FILTER_OPTIONS: Array<{
  id: ShareLinkFilter;
  messageKey: "active" | "inactive" | "expired" | "viewLimitReached";
  iconSrc: string;
  background: "sunburst" | "halftone" | "solid";
  color: ComicPanelColor;
  bubbleStyle: "circle" | "diamond" | "thought" | "rectangle";
}> = [
  {
    id: "active",
    messageKey: "active",
    iconSrc: "/share_links_filter/active.svg",
    background: "sunburst",
    color: "green",
    bubbleStyle: "circle",
  },
  {
    id: "inactive",
    messageKey: "inactive",
    iconSrc: "/share_links_filter/inactive.svg",
    background: "halftone",
    color: "blue",
    bubbleStyle: "rectangle",
  },
  {
    id: "expired",
    messageKey: "expired",
    iconSrc: "/share_links_filter/expired.svg",
    background: "solid",
    color: "#ceaf82",
    bubbleStyle: "diamond",
  },
  {
    id: "view_limit_reached",
    messageKey: "viewLimitReached",
    iconSrc: "/share_links_filter/limit_reached.svg",
    background: "solid",
    color: "#7f87de",
    bubbleStyle: "thought",
  },
];
