import type { ComicPanelColor } from "@/components/ComicPageLayout";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

export const SHARE_LINK_ACTION_ICONS = {
  preview: "/share_link_actions/preview.svg",
  showLabels: "/share_link_actions/show_labels.svg",
  hideLabels: "/share_link_actions/hide_labels.svg",
  delete: "/share_link_actions/delete.svg",
  followLink: "/share_link_actions/follow_link.svg",
  editLabels: "/share_link_actions/edit_labels.svg",
  done: "/share_link_actions/done.svg",
} as const;

export const SHARE_LINK_ACTION_COLORS = {
  preview: { panel: "#ffe9a8", hover: "#ffd35c" },
  showLabels: { panel: "#ffffff", hover: "#f5f4f9" },
  hideLabels: { panel: "#111111", hover: "#3a3a3a" },
  delete: { panel: "#ffaea8", hover: "var(--accent-red, #aa1f3f)" },
  followLink: { panel: "#c0d5ff", hover: "#ffc0c8" },
  editLabels: { panel: "#e9beff", hover: "#e4b1fd" },
  done: { panel: "#c0ffc3", hover: "#6dfe73" },
} as const satisfies Record<string, { panel: ComicPanelColor; hover: string }>;


const COMMON_CAPTION_TOP = "0.5rem"
const COMMON_CAPTION_RIGHT = "12px"
/** Absolute icon + caption placement per action panel (6.25rem wide column). */
export const SHARE_LINK_ACTION_LAYOUTS = {
  preview: {
    icon: { size: "3.5rem", top: "0.4rem", left: "0rem", rotateDeg: 0 },
    caption: { top: COMMON_CAPTION_TOP, right: "6px", rotateDeg: 0 },
  },
  followLink: {
    icon: { size: "3rem", top: "0.4rem", left: "0rem", rotateDeg: 0 },
    caption: { top: COMMON_CAPTION_TOP, right: "6px", rotateDeg: 0 },
  },
  showLabels: {
    icon: { size: "3.5rem", bottom: "0rem", right: "2.8rem", rotateDeg: 0 },
    caption: { top: COMMON_CAPTION_TOP, right: "0px", rotateDeg: 0 },  },
  hideLabels: {
    icon: { size: "3.5rem", bottom: "0rem", right: "2.8rem", rotateDeg: 0 },
    caption: { top: COMMON_CAPTION_TOP, right: "0px", rotateDeg: 0 },
  },
  delete: {
    icon: { size: "2.8rem", top: "0.4rem", left: "0rem", rotateDeg: 0 },
    caption: { top: COMMON_CAPTION_TOP, right: COMMON_CAPTION_RIGHT, rotateDeg: 0 },
  },
} as const satisfies Record<string, ShareLinkActionLayout>;

const PREVIEW_CAPTION_TOP_RIGHT = { top: "0.4rem", right: "0.5rem", rotateDeg: 0 } as const;

/** Preview modal footer panels (8rem × 6rem): caption top-right, icon bottom-left. */
export const SHARE_LINK_PREVIEW_ACTION_LAYOUTS = {
  showLabels: {
    icon: { size: "8rem", bottom: "0rem", left: "0.2rem", rotateDeg: 0 },
    caption: PREVIEW_CAPTION_TOP_RIGHT,
  },
  hideLabels: {
    icon: { size: "8rem", bottom: "0rem", left: "0.2rem", rotateDeg: 0 },
    caption: PREVIEW_CAPTION_TOP_RIGHT,
  },
  editLabels: {
    icon: { size: "5rem", bottom: "0.1rem", left: "0.4rem", rotateDeg: 0 },
    caption: PREVIEW_CAPTION_TOP_RIGHT,
  },
  followLink: {
    icon: { size: "5rem", bottom: "0rem", left: "0.4rem", rotateDeg: 0 },
    caption: PREVIEW_CAPTION_TOP_RIGHT,
  },
  done: {
    icon: { size: "5rem", bottom: "0rem", right: "50%", rotateDeg: 0 },
    caption: { top: "20%", right: "5%", rotateDeg: 0, fontSize: "2rem" },
  },
} as const satisfies Record<string, ShareLinkActionLayout>;

export const SHARE_LINK_PREVIEW_LABELS_TOGGLE_LAYOUTS = {
  show: {
    icon: { size: "4.5rem", bottom: "0rem", left: "0.2rem", rotateDeg: 0 },
    caption: PREVIEW_CAPTION_TOP_RIGHT,
  },
  hide: {
    icon: { size: "4.5rem", bottom: "0rem", left: "0.2rem", rotateDeg: 0 },
    caption: PREVIEW_CAPTION_TOP_RIGHT,
  },
} as const;
