import type { ComicPagePanelProps } from "@/components/ComicPageLayout";

export type ShareLinkActionButtonProps = {
  src: string;
  caption: string;
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
