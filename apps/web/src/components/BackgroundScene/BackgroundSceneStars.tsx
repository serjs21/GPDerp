import type { CSSProperties } from "react";
import { formatCssNumber } from "@/theme/celestialTheme";
import {
  BACKGROUND_SCENE_NN_STAR,
  twilightSubPathOpacity,
} from "./backgroundSceneNnStar.config";
import styles from "./BackgroundSceneStars.module.css";

const STAR_SRCS = [
  "/stars/star1.svg",
  "/stars/star2.svg",
  "/stars/star3.svg",
  "/stars/star4.svg",
  "/stars/star5.svg",
  "/stars/star6.svg",
] as const;

/** Stable mix across `/stars/star*.svg` (same pattern as StyleNavigationWheel). */
function starSrcForIndex(index: number): string {
  return STAR_SRCS[(index * 5 + 1) % STAR_SRCS.length]!;
}

/** Deterministic 0..1 from index — avoids Math.random hydration drift. */
function unitNoise(index: number, salt: number): number {
  const n = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function starOpacityForIndex(index: number): number {
  return Number((0.2 + unitNoise(index, 1) * 0.4).toFixed(4));
}

type StarPlacement = {
  left: string;
  top: string;
  sizeRem: number;
  rotationDeg: number;
};

/** Dense upper-sky field; sizes stay small so the art reads as sparkle, not icons. */
const STAR_POSITIONS: readonly StarPlacement[] = [
  { left: "4%", top: "6%", sizeRem: 0.42, rotationDeg: 12 },
  { left: "9%", top: "14%", sizeRem: 0.35, rotationDeg: 48 },
  { left: "12%", top: "3%", sizeRem: 0.55, rotationDeg: 95 },
  { left: "16%", top: "22%", sizeRem: 0.38, rotationDeg: 160 },
  { left: "18%", top: "9%", sizeRem: 0.48, rotationDeg: 210 },
  { left: "22%", top: "17%", sizeRem: 0.32, rotationDeg: 25 },
  { left: "26%", top: "5%", sizeRem: 0.5, rotationDeg: 280 },
  { left: "29%", top: "13%", sizeRem: 0.36, rotationDeg: 55 },
  { left: "33%", top: "24%", sizeRem: 0.44, rotationDeg: 130 },
  { left: "36%", top: "7%", sizeRem: 0.4, rotationDeg: 200 },
  { left: "40%", top: "15%", sizeRem: 0.58, rotationDeg: 300 },
  { left: "43%", top: "3%", sizeRem: 0.34, rotationDeg: 75 },
  { left: "47%", top: "20%", sizeRem: 0.46, rotationDeg: 240 },
  { left: "50%", top: "8%", sizeRem: 0.38, rotationDeg: 15 },
  { left: "54%", top: "14%", sizeRem: 0.52, rotationDeg: 175 },
  { left: "57%", top: "4%", sizeRem: 0.33, rotationDeg: 90 },
  { left: "61%", top: "19%", sizeRem: 0.45, rotationDeg: 220 },
  { left: "64%", top: "10%", sizeRem: 0.37, rotationDeg: 40 },
  { left: "68%", top: "26%", sizeRem: 0.5, rotationDeg: 310 },
  { left: "71%", top: "6%", sizeRem: 0.35, rotationDeg: 105 },
  { left: "75%", top: "16%", sizeRem: 0.48, rotationDeg: 185 },
  { left: "78%", top: "3%", sizeRem: 0.4, rotationDeg: 265 },
  { left: "82%", top: "12%", sizeRem: 0.36, rotationDeg: 70 },
  { left: "85%", top: "22%", sizeRem: 0.54, rotationDeg: 145 },
  { left: "89%", top: "7%", sizeRem: 0.32, rotationDeg: 230 },
  { left: "93%", top: "15%", sizeRem: 0.47, rotationDeg: 20 },
  { left: "96%", top: "5%", sizeRem: 0.38, rotationDeg: 290 },
  { left: "7%", top: "28%", sizeRem: 0.34, rotationDeg: 110 },
  { left: "14%", top: "32%", sizeRem: 0.42, rotationDeg: 195 },
  { left: "21%", top: "29%", sizeRem: 0.36, rotationDeg: 250 },
  { left: "31%", top: "31%", sizeRem: 0.49, rotationDeg: 35 },
  { left: "38%", top: "27%", sizeRem: 0.33, rotationDeg: 155 },
  { left: "45%", top: "33%", sizeRem: 0.41, rotationDeg: 270 },
  { left: "52%", top: "28%", sizeRem: 0.37, rotationDeg: 80 },
  { left: "59%", top: "34%", sizeRem: 0.45, rotationDeg: 205 },
  { left: "66%", top: "30%", sizeRem: 0.35, rotationDeg: 320 },
  { left: "73%", top: "35%", sizeRem: 0.43, rotationDeg: 60 },
  { left: "80%", top: "29%", sizeRem: 0.39, rotationDeg: 140 },
  { left: "87%", top: "33%", sizeRem: 0.31, rotationDeg: 255 },
  { left: "94%", top: "27%", sizeRem: 0.46, rotationDeg: 5 },
  { left: "5%", top: "38%", sizeRem: 0.34, rotationDeg: 170 },
  { left: "11%", top: "42%", sizeRem: 0.4, rotationDeg: 215 },
  { left: "25%", top: "40%", sizeRem: 0.36, rotationDeg: 95 },
  { left: "42%", top: "39%", sizeRem: 0.48, rotationDeg: 305 },
  { left: "56%", top: "41%", sizeRem: 0.33, rotationDeg: 50 },
  { left: "70%", top: "38%", sizeRem: 0.41, rotationDeg: 125 },
  { left: "84%", top: "40%", sizeRem: 0.37, rotationDeg: 235 },
  { left: "97%", top: "36%", sizeRem: 0.44, rotationDeg: 340 },
];

type BackgroundSceneStarsProps = {
  /** Night field opacity (usual star scatter). */
  opacity: number;
  /** Sun opacity drives nnstar twilight window (day↔night sub-path). */
  sunOpacity: number;
  /** Kept for API compatibility; SVG stars use their own palette. */
  moonColor?: string;
};

function NnStar({ sunOpacity }: { sunOpacity: number }) {
  const opacity = twilightSubPathOpacity(sunOpacity);
  if (opacity <= 0) return null;

  const { src, leftPercent, topPercent, sizeRem, rotationDeg } =
    BACKGROUND_SCENE_NN_STAR;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- public SVG sky asset
    <img
      src={src}
      alt=""
      draggable={false}
      className={styles.nnStar}
      style={
        {
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          width: `${sizeRem}rem`,
          opacity: Number(formatCssNumber(opacity)),
          transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
        } as CSSProperties
      }
    />
  );
}

export function BackgroundSceneStars({
  opacity,
  sunOpacity,
}: BackgroundSceneStarsProps) {
  const showField = opacity > 0;
  const nnOpacity = twilightSubPathOpacity(sunOpacity);
  const showNnStar = nnOpacity > 0;

  if (!showField && !showNnStar) return null;

  return (
    <div className={styles.field} aria-hidden>
      {showField
        ? STAR_POSITIONS.map((position, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- public SVG sky assets
            <img
              key={`background-scene-star-${index}`}
              src={starSrcForIndex(index)}
              alt=""
              draggable={false}
              className={styles.star}
              style={
                {
                  left: position.left,
                  top: position.top,
                  width: `${position.sizeRem}rem`,
                  opacity: Number(
                    formatCssNumber(starOpacityForIndex(index) * opacity),
                  ),
                  transform: `translate(-50%, -50%) rotate(${position.rotationDeg}deg)`,
                } as CSSProperties
              }
            />
          ))
        : null}
      <NnStar sunOpacity={sunOpacity} />
    </div>
  );
}
