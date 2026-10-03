import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

const ROW_ICON = { size: "2.4rem", top: "0.2rem", left: "0.4rem", rotateDeg: 0 } as const;
const ROW_CAPTION = { top: "1.1rem", right: "0.6rem", rotateDeg: 0 } as const;

/**
 * Icon + caption placement per action panel in the horizontal strip
 * (≈3.2rem tall, wider than tall): icon left, caption right.
 */
export const SHARE_LINK_ACTION_ROW_LAYOUTS = {
  preview: { icon: ROW_ICON, caption: ROW_CAPTION },
  followLink: { icon: ROW_ICON, caption: ROW_CAPTION },
  showLabels: {
    icon: { size: "2.8rem", bottom: "0rem", left: "0.3rem", rotateDeg: 0 },
    caption: ROW_CAPTION,
  },
  hideLabels: {
    icon: { size: "2.8rem", bottom: "0rem", left: "0.3rem", rotateDeg: 0 },
    caption: ROW_CAPTION,
  },
  delete: {
    icon: { size: "2.2rem", top: "0.3rem", left: "0.4rem", rotateDeg: 0 },
    caption: ROW_CAPTION,
  },
} as const satisfies Record<string, ShareLinkActionLayout>;
