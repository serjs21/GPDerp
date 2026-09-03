"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import styles from "./ComicLabelText.module.css";

export type ComicLabelTextSize = "sm" | "md" | "lg";

export type ComicLabelTextProps = {
  /** Text content to display */
  text: string;
  /** Fill color (default: white #ffffff) */
  color?: string;
  /** Outline color (default: black #000000) */
  outlineColor?: string;
  /** Outline width in pixels (default: 3) */
  outlineWidth?: number;
  /** Predefined size: sm (1.2rem, 2px), md (1.8rem, 3px), lg (2.5rem, 4px) */
  size?: ComicLabelTextSize;
  /** Custom CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Optional children (alternative to text prop) */
  children?: ReactNode;
};

/**
 * Comic-style text with bold black outline (Bangers font).
 * Uses combined -webkit-text-stroke and text-shadow for maximum impact.
 * Standalone component—no bubble or stage required.
 */
export const ComicLabelText = forwardRef<HTMLSpanElement, ComicLabelTextProps>(
  function ComicLabelText(
    {
      text,
      color = "#ffffff",
      outlineColor = "#000000",
      outlineWidth = 3,
      size = "md",
      className,
      style,
      children,
    },
    ref,
  ) {
    const sizeClass = {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size];

    const combinedStyle: CSSProperties = {
      color,
      WebkitTextStroke: `${outlineWidth}px ${outlineColor}`,
      textShadow: generateTextShadow(outlineColor, outlineWidth),
      ...style,
    };

    return (
      <span
        ref={ref}
        className={[styles.text, sizeClass, className].filter(Boolean).join(" ")}
        style={combinedStyle}
      >
        {children ?? text}
      </span>
    );
  },
);

/**
 * Generate layered text-shadow for additional outline depth.
 * Creates a ring of shadows around the text for fallback and extra boldness.
 */
function generateTextShadow(color: string): string {
  const shadows: string[] = [];
  const offsets = [-2, -1, 1, 2];

  // Directional shadows: top, bottom, left, right, diagonals
  for (const offsetX of offsets) {
    for (const offsetY of offsets) {
      if (offsetX === 0 && offsetY === 0) continue;
      shadows.push(`${offsetX}px ${offsetY}px 0 ${color}`);
    }
  }

  return shadows.join(", ");
}
