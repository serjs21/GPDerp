import type { CSSProperties } from "react";
import type { ComicPagePanelProps } from "@/components/ComicPageLayout";

/**
 * Absolute placement inside the action panel; lengths are CSS values.
 * Anchor vertically from exactly one side (`top` or `bottom`) and
 * horizontally from exactly one side (`right` or `left`).
 */
export type ShareLinkActionPlacement = {
  rotateDeg: number;
} & ({ top: string; bottom?: never } | { bottom: string; top?: never }) &
  ({ right: string; left?: never } | { left: string; right?: never });

export type ShareLinkActionIconPlacement = ShareLinkActionPlacement & {
  /** Icon box width (CSS length); height follows the aspect ratio unless `height` is set. */
  size: string;
  /** Icon height (CSS length); omitted keeps the stylesheet default (`auto`). */
  height?: string;
};

export type ShareLinkActionCaptionPlacement = ShareLinkActionPlacement & {
  /** Caption font size (CSS length); omitted keeps the stylesheet default. */
  fontSize?: string;
  /** Caption box width (CSS length); omitted keeps the stylesheet default. */
  width?: string;
  textAlign?: CSSProperties["textAlign"];
};

export type ShareLinkActionLayout = {
  icon: ShareLinkActionIconPlacement;
  caption: ShareLinkActionCaptionPlacement;
};

export type ShareLinkActionButtonProps = {
  src: string;
  caption: string;
  captionClassName?: string;
  /** Extra class on the panel root. */
  className?: string;
  layout: ShareLinkActionLayout;
  /** Placement used when the actions stack renders as a horizontal strip. */
  rowLayout?: ShareLinkActionLayout;
  ariaLabel: string;
  onSelect: () => void;
  color: NonNullable<ComicPagePanelProps["color"]>;
  background?: NonNullable<ComicPagePanelProps["background"]>;
  isMotionBackground?: NonNullable<ComicPagePanelProps["isMotionBackground"]>;
  /** Rotate sunburst rays (only with a sunburst background). */
  shine?: NonNullable<ComicPagePanelProps["shine"]>;
  /** Ray / speed-line color; needed for hex `color`s, whose accent otherwise equals the base. */
  accentColor?: string;
  hoverFill: string;
  disabled?: boolean;
  /** Maps to the panel's `aria-pressed`; defaults to true (non-toggle actions). */
  pressed?: boolean;
  busy?: boolean;
  /** Light caption + inverted hover icon for dark panels. */
  inverted?: boolean;
  /** White caption on hover (for dark hover fills); the icon is never filtered. */
  invertCaptionOnHover?: boolean;
};
