import type { CSSProperties } from "react";
import type { DualityButtonProps } from "./DualityButton.types";

export type CoverStateProps = {
  /** Cover glyph (e.g. `/sort_button/time_cover.svg`). */
  iconSrc: string;
  /** Title in the direction-arrow slot; morphs into the arrow on open. */
  title: string;
  /** Fixed title font size (rem) so sibling coins can share one size. */
  titleFontSizeRem?: number;
  /**
   * Face + CoverIcon diameter in rem. CoverIcon and DualityButton share this
   * via `--duality-face-size` (default 4.25).
   */
  sizeRem?: number;
  /** Controlled uncovered state. */
  uncovered?: boolean;
  defaultUncovered?: boolean;
  onUncoveredChange?: (uncovered: boolean) => void;
  /** CoverLabel morph duration (ms). Coin flip is fixed at COVER_ICON_EXIT_MS. */
  labelMorphMs?: number;
  /** Round CoverIcon label fill. Defaults to paper white. */
  coverBackgroundColor?: string;
  /** Mirror the cover glyph horizontally. */
  coverMirrored?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the cover control. Defaults to `Reveal {title}`. */
  coverAriaLabel?: string;
} & Omit<DualityButtonProps, "className" | "style" | "showDirection">;

export type CoverStateHitButtonProps = Pick<CoverStateProps, "title" | "coverAriaLabel"> & {
  disabled: boolean;
  onClick: () => void;
};
