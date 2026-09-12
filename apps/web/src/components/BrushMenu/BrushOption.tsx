"use client";

import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  BRUSH_MENU_ICON_HEIGHT,
  BRUSH_MENU_ICON_VIEWBOX,
  BRUSH_MENU_ICON_WIDTH,
  BRUSH_MENU_REVEAL_D,
  brushMenuIconForIndex,
  type BrushMenuIconSrc,
} from "./brushMenuIcons";
import styles from "./BrushOption.module.css";

export type BrushOptionProps = {
  label: ReactNode;
  /** Option index in the menu; selects brush_menu icon via round-robin. */
  index?: number;
  /** Override round-robin icon when set. */
  iconSrc?: BrushMenuIconSrc | string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onSelect?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">;

/**
 * Option row with brush_menu stroke as masked background.
 * Reveal path is exposed via ref for anime.js createDrawable (LTR mask reveal).
 */
export const BrushOption = forwardRef<SVGPathElement, BrushOptionProps>(
  function BrushOption(
    {
      label,
      index = 0,
      iconSrc,
      selected = false,
      disabled = false,
      className,
      onSelect,
      type = "button",
      ...rest
    },
    revealRef,
  ) {
    const reactId = useId();
    const maskId = `brush-option-mask-${reactId.replace(/:/g, "")}`;
    const resolvedIconSrc = iconSrc ?? brushMenuIconForIndex(index);

    return (
      <button
        type={type}
        className={`${styles.option}${selected ? ` ${styles.selected}` : ""}${
          className ? ` ${className}` : ""
        }`}
        disabled={disabled}
        aria-pressed={selected}
        onClick={() => {
          if (disabled) return;
          onSelect?.();
        }}
        {...rest}
      >
        <svg
          className={styles.brush}
          viewBox={BRUSH_MENU_ICON_VIEWBOX}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={BRUSH_MENU_ICON_WIDTH}
              height={BRUSH_MENU_ICON_HEIGHT}
            >
              {/* White stroke paints the mask; createDrawable reveals LTR. */}
              <path
                ref={revealRef}
                d={BRUSH_MENU_REVEAL_D}
                fill="none"
                stroke="#ffffff"
                strokeWidth={BRUSH_MENU_ICON_HEIGHT}
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <image
              href={resolvedIconSrc}
              width={BRUSH_MENU_ICON_WIDTH}
              height={BRUSH_MENU_ICON_HEIGHT}
              preserveAspectRatio="none"
            />
          </g>
        </svg>
        <span className={styles.label}>{label}</span>
      </button>
    );
  },
);
