"use client";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import {
  BRUSH_MENU_ICON_HEIGHT,
  BRUSH_MENU_ICON_VIEWBOX,
  BRUSH_MENU_ICON_WIDTH,
  brushMenuIconForIndex,
  type BrushMenuIconSrc,
} from "./brushMenuIcons";
import { BRUSH_REVEAL_PATHS } from "./brushRevealPaths";
import styles from "./BrushOption.module.css";

/** One SVGPathElement per entry in BRUSH_REVEAL_PATHS (same order). */
export type BrushOptionBrushPaths = SVGPathElement[];

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
  className?: string;
  onSelect?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">;

function sanitizeSvgId(reactId: string): string {
  return reactId.replace(/:/g, "");
}

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
  className,
  onSelect,
  type = "button",
  ...rest
}: BrushOptionProps) {
  const reactId = useId();
  const idBase = sanitizeSvgId(reactId);
  const maskId = `brush-option-mask-${idBase}`;
  const resolvedIconSrc = iconSrc ?? brushMenuIconForIndex(index);

  const pathRefs = useRef<(SVGPathElement | null)[]>(
    BRUSH_REVEAL_PATHS.map(() => null),
  );
  const onBrushPathsRef = useRef(onBrushPaths);
  onBrushPathsRef.current = onBrushPaths;

  useEffect(() => {
    const paths = pathRefs.current.filter(
      (path): path is SVGPathElement => path != null,
    );
    if (paths.length === BRUSH_REVEAL_PATHS.length) {
      onBrushPathsRef.current?.(paths);
    }
    return () => {
      onBrushPathsRef.current?.(null);
    };
  }, []);

  return (
    <button
      type={type}
      className={`${styles.option}${selected ? ` ${styles.selected}` : ""}${
        displayOnly ? ` ${styles.displayOnly}` : ""
      }${className ? ` ${className}` : ""}`}
      disabled={disabled}
      aria-pressed={selected}
      {...rest}
      tabIndex={displayOnly ? -1 : rest.tabIndex}
      aria-disabled={displayOnly || disabled || undefined}
      onClick={() => {
        if (disabled || displayOnly || !onSelect) return;
        onSelect();
      }}
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
            <rect
              width={BRUSH_MENU_ICON_WIDTH}
              height={BRUSH_MENU_ICON_HEIGHT}
              fill="#000000"
            />
            {BRUSH_REVEAL_PATHS.map((def, pathIndex) => (
              <path
                key={def.id}
                ref={(node) => {
                  pathRefs.current[pathIndex] = node;
                }}
                d={def.d}
                fill="none"
                stroke="#ffffff"
                strokeWidth={def.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                data-brush-pass={def.id}
              />
            ))}
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
      <span ref={labelRef} className={styles.label}>
        {label}
      </span>
    </button>
  );
}
