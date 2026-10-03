import type { ComicPanelColor } from "@/components/ComicPageLayout";
import type { CalloutPosition } from "@/components/HoverHoldCallout";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

export const SHARE_LINK_UPDATE_ICONS = {
  enabled: "/share_link_actions/update.svg",
  disabled: "/share_link_actions/update_disabled.svg",
} as const;

export const SHARE_LINK_UPDATE_COLORS = {
  panel: "#c0d2ff",
  hover: "#8aabff",
} as const satisfies { panel: ComicPanelColor; hover: string };

/** Absolute icon + caption placement inside the 6.25rem-wide Update panel. */
export const SHARE_LINK_UPDATE_LAYOUT = {
  icon: { size: "3em", top: "0rem", left: "0rem", rotateDeg: 0 },
  caption: { top: "35%", right: "12px", rotateDeg: 0 },
} as const satisfies ShareLinkActionLayout;

export const SHARE_LINK_UPDATE_DISABLED_MESSAGES = {
  inactive: "What is yet to begin - can't be changed",
  unchanged: "Everything's in its right place",
} as const;

/** Bubble floats to the right of the Update panel (mirror of Tune in's left callout). */
export const SHARE_LINK_UPDATE_CALLOUT_POSITION = {
  right: "calc(70% + 0.6rem)",
  bottom: "0rem",
} as const satisfies CalloutPosition;

export const SHARE_LINK_UPDATE_CALLOUT_TIMING = {
  holdMs: 3000,
  fadeMs: 200,
} as const;
