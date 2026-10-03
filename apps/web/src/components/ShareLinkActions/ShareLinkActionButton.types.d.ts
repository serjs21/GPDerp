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
  /** Icon box width and height (CSS length). */
  size: string;
};

export type ShareLinkActionCaptionPlacement = ShareLinkActionPlacement & {
  /** Caption font size (CSS length); omitted keeps the stylesheet default. */
  fontSize?: string;
};

export type ShareLinkActionLayout = {
  icon: ShareLinkActionIconPlacement;
  caption: ShareLinkActionCaptionPlacement;
};

export type ShareLinkActionButtonProps = {
  src: string;
  caption: string;
  captionClassName?: string;
  layout: ShareLinkActionLayout;
  /** Placement used when the actions stack renders as a horizontal strip. */
  rowLayout?: ShareLinkActionLayout;
  ariaLabel: string;
  onSelect: () => void;
  color: NonNullable<ComicPagePanelProps["color"]>;
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
