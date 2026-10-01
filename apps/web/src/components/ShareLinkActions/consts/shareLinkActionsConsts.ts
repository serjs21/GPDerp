import type { ComicPanelColor } from "@/components/ComicPageLayout";
import type { CalloutPosition } from "@/components/HoverHoldCallout";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

export const SHARE_LINK_ACTION_ICONS = {
  preview: "/share_link_actions/preview.svg",
  update: "/share_link_actions/update.svg",
  updateDisabled: "/share_link_actions/update_disabled.svg",
  showLabels: "/share_link_actions/show_labels.svg",
  hideLabels: "/share_link_actions/hide_labels.svg",
  delete: "/share_link_actions/delete.svg",
} as const;

export const SHARE_LINK_ACTION_COLORS = {
  preview: { panel: "#ffe9a8", hover: "#ffd35c" },
  update: { panel: "#c0d2ff", hover: "#8aabff" },
  showLabels: { panel: "#ffffff", hover: "#d9d9da" },
  hideLabels: { panel: "#111111", hover: "#3a3a3a" },
  delete: { panel: "#ffaea8", hover: "var(--accent-red, #aa1f3f)" },
} as const satisfies Record<string, { panel: ComicPanelColor; hover: string }>;

/** Absolute icon + caption placement per action panel (6.25rem wide column). */
export const SHARE_LINK_ACTION_LAYOUTS = {
  preview: {
    icon: { size: "3.5rem", top: "0rem", right: "2.5rem", rotateDeg: 0 },
    caption: { top: "14px", right: "4px", rotateDeg: 0 },
  },
  update: {
    icon: { size: "3em", top: "0rem", left: "0rem", rotateDeg: 0 },
    caption: { top: "14px", right: "4px", rotateDeg: 0 },
    },
  showLabels: {
    icon: { size: "3.5rem", top: "0rem", right: "2.8rem", rotateDeg: 0 },
    caption: { top: "10px", right: "0px", rotateDeg: 0 },  },
  hideLabels: {
    icon: { size: "3.5rem", top: "0rem", right: "2.8rem", rotateDeg: 0 },
    caption: { top: "10px", right: "0px", rotateDeg: 0 },
  },
  delete: {
    icon: { size: "3rem", top: "0rem", right: "0rem", rotateDeg: 0 },
    caption: { top: "14px", right: "4px", rotateDeg: 0 },
  },
} as const satisfies Record<string, ShareLinkActionLayout>;

export const SHARE_LINK_UPDATE_DISABLED_MESSAGES = {
  inactive: "What is yet to be started cannot be changed",
  unchanged: "Everything is in it's right place",
} as const;

/** Bubble floats to the right of the Update panel (mirror of Tune in's left callout). */
export const SHARE_LINK_UPDATE_CALLOUT_POSITION = {
  left: "calc(70% + 0.6rem)",
  bottom: "0rem",
} as const satisfies CalloutPosition;
