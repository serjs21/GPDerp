"use client";

import { withDefaults } from "@/utils/props/withDefaults";
import { BrushPaintLayer, type BrushOptionBrushPaths } from "./BrushPaintLayer";
import type { BrushOptionProps } from "./BrushOption.types";
import {
  brushOptionA11y,
  brushOptionClassName,
  brushOptionIconSrc,
  brushOptionStyle,
} from "./utils/brushOptionUtils";
import styles from "./BrushOption.module.css";

export type { BrushOptionBrushPaths };
export type { BrushOptionProps } from "./BrushOption.types";

const BRUSH_OPTION_DEFAULTS = {
  index: 0,
  selected: false,
  disabled: false,
  displayOnly: false,
  type: "button",
} as const;

/**
 * Option row with ink_brush stroke as masked background.
 * Multiple artificial brush paths in the mask are drawn L→R via createDrawable
 * to paint-reveal the finished artwork (not the artwork outline).
 */
export function BrushOption({
  label,
  index,
  iconSrc,
  labelRef,
  onBrushPaths,
  selected,
  disabled,
  displayOnly,
  color,
  backgroundColor,
  className,
  onSelect,
  type,
  style,
  ...rest
}: BrushOptionProps) {
  const resolved = withDefaults({ index, selected, disabled, displayOnly, type }, BRUSH_OPTION_DEFAULTS);

  return (
    <button
      type={resolved.type}
      className={brushOptionClassName(styles, resolved.selected, resolved.displayOnly, className)}
      disabled={resolved.disabled}
      aria-pressed={resolved.selected}
      {...rest}
      style={brushOptionStyle(style, color, backgroundColor)}
      {...brushOptionA11y(resolved.displayOnly, resolved.disabled, rest.tabIndex)}
      onClick={() => {
        if (resolved.disabled || resolved.displayOnly || !onSelect) return;
        onSelect();
      }}
    >
      <BrushPaintLayer
        index={resolved.index}
        iconSrc={brushOptionIconSrc(iconSrc, resolved.index)}
        onBrushPaths={onBrushPaths}
      />
      <span ref={labelRef} className={styles.label}>
        {label}
      </span>
    </button>
  );
}
