import type { ComicPagePanelProps } from "@/components/ComicPageLayout";

/**
 * Absolute placement inside the action panel; lengths are CSS values.
 * Anchor horizontally from exactly one side: `right` or `left`.
 */
export type ShareLinkActionPlacement = {
  top: string;
  rotateDeg: number;
} & ({ right: string; left?: never } | { left: string; right?: never });

export type ShareLinkActionIconPlacement = ShareLinkActionPlacement & {
  /** Icon box width and height (CSS length). */
  size: string;
};

export type ShareLinkActionLayout = {
  icon: ShareLinkActionIconPlacement;
  caption: ShareLinkActionPlacement;
};

export type ShareLinkActionButtonProps = {
  src: string;
  caption: string;
  captionClassName?: string;
  layout: ShareLinkActionLayout;
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
