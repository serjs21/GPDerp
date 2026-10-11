import type { CSSProperties } from "react";
import type { DualityIconTone } from "./DualityFaceIcon.types";

export type DualityButtonProps = {
  /** Icon shown at the top of the face (e.g. “new”). Ignored when `centerIconSrc` is set. */
  topIconSrc?: string;
  /** Icon shown at the bottom of the face (e.g. “old”). Ignored when `centerIconSrc` is set. */
  bottomIconSrc?: string;
  /** Single centered glyph (e.g. time remaining). Overrides top/bottom. */
  centerIconSrc?: string;
  /** Size multiplier for the centered glyph (default 2). */
  centerIconScale?: number;
  /**
   * `mask` — mono tint (black/white swap on flip).
   * `strokeInvert` — only black ink flips; light fills stay as authored.
   * `image` — full-color artwork drawn as authored (no tint, no flip swap).
   */
  iconTone?: DualityIconTone;
  /** Controlled flip state. When omitted, the button manages its own state. */
  flipped?: boolean;
  /** Initial flip when uncontrolled. */
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** When false, hides the curved direction cue (e.g. while a cover overlay is up). */
  showDirection?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label": string;
};

export type DualityEndIconsProps = Pick<DualityButtonProps, "topIconSrc" | "bottomIconSrc"> & {
  iconTone: DualityIconTone;
};
