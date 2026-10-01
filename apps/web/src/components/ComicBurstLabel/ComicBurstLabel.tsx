"use client";

import { memo, useMemo, type CSSProperties, type ReactNode } from "react";
import {
  layoutComicBurstLabel,
  type ComicBurstShapeKind,
} from "./comicBurstPath";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import {
  burstDisplayFontSize,
  estimateComicBurstTextWidth,
  measureComicBurstTextWidth,
} from "./measureComicBurstText";
import styles from "./ComicBurstLabel.module.css";

export type ComicBurstLabelProps = {
  text: string;
  fill?: string;
  stroke?: string;
  textColor?: string;
  spikeCount?: number;
  randomness?: number;
  /** Silhouette family: burst spikes, ellipse, rounded square, or thought cloud. */
  shapeKind?: ComicBurstShapeKind;
  paddingX?: number;
  paddingY?: number;
  strokeWidth?: number;
  /** Optional override; defaults to `text` for deterministic silhouettes. */
  seed?: string | number;
  /** Optional fixed size; when omitted, uses short/long display size from text length. */
  fontSize?: number;
  className?: string;
  /** Optional content before lettering (e.g. an icon). Ignored when `children` replaces text. */
  leading?: ReactNode;
  /** When set, replaces lettering with custom content (e.g. an avatar icon). */
  children?: ReactNode;
};

const DEFAULT_FILL = "#f4511e";
const DEFAULT_STROKE = "#000000";
const DEFAULT_TEXT_COLOR = "#ffffff";

function resolveBurstLayout(params: {
  text: string;
  fontSizeProp?: number;
  paddingX: number;
  paddingY: number;
  spikeCount: number;
  randomness: number;
  seedKey: string | number;
  shapeKind: ComicBurstShapeKind;
  hasChildren: boolean;
  hasLeading: boolean;
  canMeasure: boolean;
}) {
  const {
    text,
    fontSizeProp,
    paddingX,
    paddingY,
    spikeCount,
    randomness,
    seedKey,
    shapeKind,
    hasChildren,
    hasLeading,
    canMeasure,
  } = params;
  const fontSize = fontSizeProp ?? burstDisplayFontSize(text);
  // Icon/custom content: size from fontSize box, not lettering width.
  const leadingExtra = hasLeading ? fontSize * 1.2 : 0;
  // Canvas measuring only after hydration so SSR and first client render match.
  const letteringWidth = canMeasure
    ? measureComicBurstTextWidth(text, fontSize)
    : estimateComicBurstTextWidth(text, fontSize);
  const textWidth = hasChildren ? fontSize : letteringWidth + leadingExtra;
  const layout = layoutComicBurstLabel({
    textWidth,
    fontSize,
    paddingX,
    paddingY,
    spikeCount,
    randomness,
    seedKey,
    kind: shapeKind,
    text,
    tight: hasChildren,
  });
  const strokePx = Math.min(2.5, Math.max(1.5, fontSize * 0.08));
  return { layout, fontSize, strokePx };
}

function BurstOverlay({
  text,
  textColor,
  leading,
  children,
}: {
  text: string;
  textColor: string;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  if (children) {
    return (
      <span className={styles.labelContent} aria-hidden>
        {children}
      </span>
    );
  }
  if (leading) {
    return (
      <span className={styles.labelWithLeading} style={{ color: textColor }} aria-hidden>
        <span className={styles.labelLeading}>{leading}</span>
        <span className={styles.labelLettering}>{text}</span>
      </span>
    );
  }
  return (
    <span className={styles.labelText} style={{ color: textColor }} aria-hidden>
      {text}
    </span>
  );
}

/**
 * Comic-book impact burst label: procedural SVG spikes + Bangers KA-BLAM lettering.
 * Shape is seeded from `seed ?? text` so the silhouette stays stable across renders.
 * Longer text uses a slightly smaller display size so lettering stays inside the silhouette.
 */
function strokeCapsForShape(shapeKind: ComicBurstShapeKind): {
  strokeLinejoin: "miter" | "round";
  strokeLinecap: "square" | "round";
} {
  if (shapeKind === "rect" || shapeKind === "diamond") {
    return { strokeLinejoin: "miter", strokeLinecap: "square" };
  }
  return { strokeLinejoin: "round", strokeLinecap: "round" };
}

export const ComicBurstLabel = memo(function ComicBurstLabel(props: ComicBurstLabelProps) {
  const text = props.text;
  const fill = props.fill ?? DEFAULT_FILL;
  const stroke = props.stroke ?? DEFAULT_STROKE;
  const textColor = props.textColor ?? DEFAULT_TEXT_COLOR;
  const spikeCount = props.spikeCount ?? 12;
  const randomness = props.randomness ?? 0.18;
  const shapeKind = props.shapeKind ?? "burst";
  const paddingX = props.paddingX ?? 18;
  const paddingY = props.paddingY ?? 14;
  const strokeWidth = props.strokeWidth ?? 4;
  const className = props.className;
  const leading = props.leading;
  const children = props.children;
  const seedKey = props.seed ?? text;
  const { strokeLinejoin, strokeLinecap } = strokeCapsForShape(shapeKind);
  const canMeasure = useIsHydrated();

  const { layout, fontSize, strokePx } = useMemo(
    () =>
      resolveBurstLayout({
        text,
        fontSizeProp: props.fontSize,
        paddingX,
        paddingY,
        spikeCount,
        randomness,
        seedKey,
        shapeKind,
        hasChildren: Boolean(children),
        hasLeading: Boolean(leading),
        canMeasure,
      }),
    [
      canMeasure,
      text,
      props.fontSize,
      paddingX,
      paddingY,
      spikeCount,
      randomness,
      seedKey,
      shapeKind,
      children,
      leading,
    ],
  );

  const rootStyle = {
    "--burst-font-size": `${fontSize}px`,
    "--burst-stroke": `${strokePx}px`,
  } as CSSProperties;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={rootStyle}
      role="img"
      aria-label={text}
      data-comic-role="label"
    >
      <svg
        className={styles.svg}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d={layout.d}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin={strokeLinejoin}
          strokeLinecap={strokeLinecap}
        />
      </svg>
      <BurstOverlay text={text} textColor={textColor} leading={leading}>
        {children}
      </BurstOverlay>
    </div>
  );
});
