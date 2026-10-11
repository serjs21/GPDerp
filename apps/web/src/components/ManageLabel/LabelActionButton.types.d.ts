import type { ComicPanelBackground, ComicPanelColor } from "@/components/ComicPageLayout";

export type LabelActionLayout = "iconEnd" | "iconStart" | "iconOnly" | "iconFill";

export type LabelActionButtonProps = {
  src: string;
  caption?: string;
  ariaLabel: string;
  layout: LabelActionLayout;
  captionClassName?: string;
  iconClassName: string;
  onSelect: () => void;
  disabled?: boolean;
  /** When omitted, mirrors `!disabled` (ComicPagePanel grayscale when false). */
  selected?: boolean;
  hoverFill?: string;
  invertIconOnHover?: boolean;
  background?: ComicPanelBackground;
  color?: ComicPanelColor;
  /** Mask the icon with `--ink-on-sky` instead of showing the raw SVG fill. */
  inkOnSkyIcon?: boolean;
};
