import type { CSSProperties, ReactNode } from "react";
import type { ComicPanelBackground, ComicPanelColor } from "./comicPagePresets";

export type ComicPanelTitleDirection = "horizontal" | "vertical";

export type ComicPagePanelProps = {
  children?: ReactNode;
  /** Comic caption box in the panel top-left corner. */
  title?: ReactNode;
  /**
   * Title caption layout.
   * - `horizontal` (default): top-left corner chip
   * - `vertical`: left-edge spine; text reads bottom → top (see sort panels)
   */
  titleDirection?: ComicPanelTitleDirection;
  /** Background color for the title caption box. Defaults to white. */
  titleColor?: ComicPanelColor;
  /** Comic caption box in the panel bottom-right corner. */
  footer?: ReactNode;
  /** Background color for the footer caption box. Defaults to white. */
  footerColor?: ComicPanelColor;
  background?: ComicPanelBackground;
  color?: ComicPanelColor;
  /**
   * Show the anime speed-line motion background.
   * Defaults to true when `background` is `"motion"`.
   */
  isMotionBackground?: boolean;
  /** Crossfade anime speed-line overlay on top of the static background. */
  loading?: boolean;
  /** When background is sunburst / sunburstHalftone, rotate rays. Default false. */
  shine?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  flexWeight?: number;
  span?: "auto" | "full";
  contentAlign?: "center" | "start";
  className?: string;
  ariaLabel?: string;
  /** Allow bubble/canvas spikes to paint outside the panel border. */
  overflowVisible?: boolean;
  /** Merged after panel color CSS variables (e.g. override `--comic-panel-base`). */
  style?: CSSProperties;
};

/** Background after resolving the motion / fine overrides. */
export type ComicPanelBackgroundMode = {
  isMotion: boolean;
  isFine: boolean;
  resolved: ComicPanelBackground;
};
