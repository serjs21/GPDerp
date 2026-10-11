import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import type { BrushMenuIconSrc } from "./brushMenuIcons";
import type { BrushOptionBrushPaths } from "./BrushPaintLayer";

export type BrushOptionProps = {
  label: ReactNode;
  /** Option index in the menu (kept for API; ink brush is shared). */
  index?: number;
  /** Override default ink brush asset when set. */
  iconSrc?: BrushMenuIconSrc | string;
  /** Label node for opacity/scale sync with the brush paint. */
  labelRef?: Ref<HTMLSpanElement>;
  /** Registers mask brush paths for Anime.js createDrawable. */
  onBrushPaths?: (paths: BrushOptionBrushPaths | null) => void;
  selected?: boolean;
  disabled?: boolean;
  /** Non-interactive row (e.g. profile header). */
  displayOnly?: boolean;
  /** Label text color (defaults to cream via CSS). */
  color?: string;
  /** Comic-burst fill behind the option icon (`--brush-option-icon-fill`). */
  backgroundColor?: string;
  className?: string;
  onSelect?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children" | "color">;
