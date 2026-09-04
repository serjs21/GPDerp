"use client";

import { type CSSProperties } from "react";
import styles from "./ComicLabel.module.css";
import { formatComicLabelText } from "./utils";

export type ComicLabelShape = "burst" | "rounded" | "square" | "thought" | "ellipse" | "diamond";

export type ComicLabelProps = {
  /** Text content (will be transformed by formatComicLabelText) */
  text: string;
  /** Bubble shape variant */
  shape: ComicLabelShape;
  /** Bubble fill color (hex string, e.g. '#ff6b35') */
  color: string;
  /** Optional CSS class */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
};

/**
 * ComicLabel: A simple comic-style label component with built-in bubble shapes.
 * Displays text (transformed to uppercase + "!") in italic Luckiest Guy font.
 * No external bubble library; all styling is CSS-based.
 *
 * @example
 * <ComicLabel text="Moon" shape="burst" color="#ff6b35" />
 */
export function ComicLabel({ text, shape, color, className, style }: ComicLabelProps) {
  const shapeClass = styles[`bubble--${shape}` as keyof typeof styles];
  const transformedText = formatComicLabelText(text);

  const builtInStyle: CSSProperties = {
    "--bubble-fill": color,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={[styles.bubble, shapeClass, className].filter(Boolean).join(" ")}
      style={builtInStyle}
    >
      <span className={styles.text}>{transformedText}</span>
    </div>
  );
}
