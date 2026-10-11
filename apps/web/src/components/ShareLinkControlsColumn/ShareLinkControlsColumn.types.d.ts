import type { ShareLinkControls } from "@/components/ShareLink/useShareLinkControls";

/** Extra classes per slot so a host layout (e.g. the share modal card) can restyle it. */
export type ShareLinkControlsColumnClassNames = {
  column?: string;
  row?: string;
  panel?: string;
  body?: string;
  update?: string;
};

export type ShareLinkControlsColumnProps = {
  ctrl: ShareLinkControls;
  classNames?: ShareLinkControlsColumnClassNames;
};
