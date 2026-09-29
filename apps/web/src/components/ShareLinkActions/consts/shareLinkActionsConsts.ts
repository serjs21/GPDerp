import type { ComicPanelColor } from "@/components/ComicPageLayout";

export const SHARE_LINK_ACTION_ICONS = {
  preview: "/share_link_actions/preview.svg",
  update: "/share_link_actions/update.svg",
  showLabels: "/share_link_actions/show_labels.svg",
  hideLabels: "/share_link_actions/hide_labels.svg",
  delete: "/share_link_actions/delete.svg",
} as const;

export const SHARE_LINK_ACTION_COLORS = {
  preview: { panel: "#ffe9a8", hover: "#ffd35c" },
  update: { panel: "#c0ffc3", hover: "#6dfe73" },
  showLabels: { panel: "sky", hover: "#8fc3e6" },
  hideLabels: { panel: "#111111", hover: "#3a3a3a" },
  delete: { panel: "#ffaea8", hover: "var(--accent-red, #aa1f3f)" },
} as const satisfies Record<string, { panel: ComicPanelColor; hover: string }>;
