import type { CSSProperties } from "react";
import type { LabelActionLayout } from "../LabelActionButton.types";
import styles from "../LabelActions.module.css";

export function rowLayoutClass(layout: LabelActionLayout): string {
  if (layout === "iconStart") return styles.iconStart;
  if (layout === "iconOnly") return styles.iconOnly;
  if (layout === "iconFill") return styles.iconFill;
  return styles.iconEnd;
}

/** Where the caption sits relative to the icon; icon-only layouts (or no caption) drop it. */
export function captionPlacement(layout: LabelActionLayout, caption: string | undefined): "none" | "before" | "after" {
  if (layout === "iconOnly" || layout === "iconFill" || !caption) return "none";
  return layout === "iconStart" ? "after" : "before";
}

export function hoverFillStyle(hoverFill: string | undefined): CSSProperties | undefined {
  return hoverFill ? ({ "--label-action-hover-fill": hoverFill } as CSSProperties) : undefined;
}

export function labelActionClassName(params: {
  selected: boolean;
  disabled: boolean;
  invertIconOnHover: boolean;
  inkOnSkyIcon: boolean;
  layout: LabelActionLayout;
}): string {
  const { selected, disabled, invertIconOnHover, inkOnSkyIcon, layout } = params;
  const preserveBg = disabled && (inkOnSkyIcon || layout === "iconFill");
  return [
    styles.action,
    !selected && styles.unpressed,
    invertIconOnHover && styles.invertOnHover,
    disabled && styles.disabled,
    preserveBg && styles.disabledPreserveBg,
  ]
    .filter(Boolean)
    .join(" ");
}
