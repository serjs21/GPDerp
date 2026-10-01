import type { ComicPagePanelProps } from "@/components/ComicPageLayout";

/** Absolute placement inside the action panel; `top`/`right` are CSS lengths. */
export type ShareLinkActionPlacement = {
  top: string;
  right: string;
  rotateDeg: number;
};

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
  invertIconOnHover?: boolean;
};
