"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import styles from "./ComicConfirmModal.module.css";

export type ComicCtaBubbleProps = {
  label: ReactNode;
  bubbleStyle?: ComicBubbleStyle;
  disabled?: boolean;
  slot?: "start" | "end" | "center";
  className?: string;
  style?: CSSProperties;
  onPointerChange?: () => void;
  onClick?: () => void;
};

/**
 * CTA bubble content — direct child of the comical stage (position: absolute)
 * so comicaljs offsetLeft/Top align with the canvas.
 */
export const ComicCtaBubble = forwardRef<HTMLButtonElement, ComicCtaBubbleProps>(
  function ComicCtaBubble(
    {
      label,
      bubbleStyle = "speech",
      disabled = false,
      slot = "center",
      className,
      style,
      onPointerChange,
      onClick,
    },
    ref,
  ) {
    const slotClass =
      slot === "start" ? styles.ctaSlotStart : slot === "end" ? styles.ctaSlotEnd : styles.ctaSlotCenter;

    return (
      <button
        ref={ref}
        type="button"
        className={[styles.ctaBubble, slotClass, className].filter(Boolean).join(" ")}
        style={style}
        disabled={disabled}
        data-comic-role="cta"
        data-bubble-style={bubbleStyle}
        onClick={onClick}
        onMouseEnter={onPointerChange}
        onMouseLeave={onPointerChange}
        onFocus={onPointerChange}
        onBlur={onPointerChange}
      >
        {label}
      </button>
    );
  },
);
