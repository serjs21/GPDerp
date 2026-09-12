"use client";

import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  BRUSHSTROKE_HEIGHT,
  BRUSHSTROKE_PATHS,
  BRUSHSTROKE_REVEAL_D,
  BRUSHSTROKE_VIEWBOX,
} from "./brushstrokePaths";
import styles from "./BrushOption.module.css";

export type BrushOptionProps = {
  label: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onSelect?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">;

/**
 * Option row with inlined brushstroke background.
 * Reveal path is exposed via ref for anime.js createDrawable (LTR mask reveal).
 */
export const BrushOption = forwardRef<SVGPathElement, BrushOptionProps>(
  function BrushOption(
    {
      label,
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
          viewBox={BRUSHSTROKE_VIEWBOX}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="238.38"
              height="38.03"
            >
              {/* White stroke paints the mask; createDrawable reveals LTR. */}
              <path
                ref={revealRef}
                className={styles.reveal}
                d={BRUSHSTROKE_REVEAL_D}
                fill="none"
                stroke="#ffffff"
                strokeWidth={BRUSHSTROKE_HEIGHT}
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            {BRUSHSTROKE_PATHS.map((path, index) => (
              <path key={index} d={path.d} fill={path.fill} />
            ))}
          </g>
        </svg>
        <span className={styles.label}>{label}</span>
      </button>
    );
  },
);
