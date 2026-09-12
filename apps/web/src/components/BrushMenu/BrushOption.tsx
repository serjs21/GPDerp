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
import {
  BRUSH_REVEAL_PATHS,
  type BrushRevealPass,
} from "./brushRevealPaths";
import styles from "./BrushOption.module.css";

export type BrushOptionBrushPaths = [
  main: SVGPathElement,
  upper: SVGPathElement,
  lower: SVGPathElement,
];

export type BrushOptionProps = {
  label: ReactNode;
  /** Option index in the menu; selects brush_menu icon via round-robin. */
  index?: number;
  /** Override round-robin icon when set. */
  iconSrc?: BrushMenuIconSrc | string;
  /** Label node for opacity/scale sync with the brush paint. */
  labelRef?: Ref<HTMLSpanElement>;
  /** Registers the three mask brush paths for Anime.js createDrawable. */
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
 * Option row with brush_menu stroke as masked background.
 * Three artificial brush paths in the mask are drawn L→R via createDrawable
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
  const filterId = `brush-option-noise-${idBase}`;
  const resolvedIconSrc = iconSrc ?? brushMenuIconForIndex(index);

  const mainRef = useRef<SVGPathElement | null>(null);
  const upperRef = useRef<SVGPathElement | null>(null);
  const lowerRef = useRef<SVGPathElement | null>(null);
  const onBrushPathsRef = useRef(onBrushPaths);
  onBrushPathsRef.current = onBrushPaths;

  useEffect(() => {
    const main = mainRef.current;
    const upper = upperRef.current;
    const lower = lowerRef.current;
    if (main && upper && lower) {
      onBrushPathsRef.current?.([main, upper, lower]);
    }
    return () => {
      onBrushPathsRef.current?.(null);
    };
  }, []);

  const pathRefForPass = (pass: BrushRevealPass) => {
    if (pass === "main") return mainRef;
    if (pass === "upper") return upperRef;
    return lowerRef;
  };

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
          <filter
            id={filterId}
            x="-5%"
            y="-20%"
            width="110%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.12"
              numOctaves={2}
              seed={2}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={2}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
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
            {BRUSH_REVEAL_PATHS.map((def) => (
              <path
                key={def.pass}
                ref={pathRefForPass(def.pass)}
                d={def.d}
                fill="none"
                stroke="#ffffff"
                strokeWidth={def.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${filterId})`}
                data-brush-pass={def.pass}
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
