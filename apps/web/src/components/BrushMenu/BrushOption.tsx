"use client";

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import {
  brushMenuIconForIndex,
  type BrushMenuIconSrc,
} from "./brushMenuIcons";
import {
  BrushPaintLayer,
  type BrushOptionBrushPaths,
} from "./BrushPaintLayer";
import styles from "./BrushOption.module.css";

export type { BrushOptionBrushPaths };

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
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "children" | "color"
>;

/**
 * Option row with ink_brush stroke as masked background.
 * Multiple artificial brush paths in the mask are drawn L→R via createDrawable
 * to paint-reveal the finished artwork (not the artwork outline).
 */
export function BrushOption({
  label,
  index = 0,
  iconSrc,
  labelRef,
  onBrushPaths,
  selected = false,
  disabled = false,
  displayOnly = false,
  color,
  backgroundColor,
  className,
  onSelect,
  type = "button",
  style,
  ...rest
}: BrushOptionProps) {
  const resolvedIconSrc = iconSrc ?? brushMenuIconForIndex(index);
  const mergedStyle =
    color || backgroundColor || style
      ? ({
          ...style,
          ...(color ? { color } : null),
          ...(backgroundColor
            ? ({ ["--brush-option-icon-fill"]: backgroundColor } as CSSProperties)
            : null),
        } as CSSProperties)
      : undefined;

  return (
    <button
      type={type}
      className={`${styles.option}${selected ? ` ${styles.selected}` : ""}${
        displayOnly ? ` ${styles.displayOnly}` : ""
      }${className ? ` ${className}` : ""}`}
      disabled={disabled}
      aria-pressed={selected}
      {...rest}
      style={mergedStyle}
      tabIndex={displayOnly ? -1 : rest.tabIndex}
      aria-disabled={displayOnly || disabled || undefined}
      onClick={() => {
        if (disabled || displayOnly || !onSelect) return;
        onSelect();
      }}
    >
      <BrushPaintLayer
        index={index}
        iconSrc={resolvedIconSrc}
        onBrushPaths={onBrushPaths}
      />
      <span ref={labelRef} className={styles.label}>
        {label}
      </span>
    </button>
  );
}
