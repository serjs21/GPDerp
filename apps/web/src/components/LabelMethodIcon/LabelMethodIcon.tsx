"use client";

import { buildComicBurstPath } from "@/components/ComicBurstLabel/comicBurstPath";
import styles from "./LabelMethodIcon.module.css";

export type LabelMethodIconBubbleStyle =
  | "speech"
  | "thought"
  | "pointedArcs"
  | "circle"
  | "caption"
  | "rectangle"
  | "diamond";

export type LabelMethodIconProps = {
  src: string;
  /**
   * Visual variant for the static CSS bubble frame.
   * Kept for call-site compatibility (no Comical / useEffect).
   */
  bubbleStyle?: LabelMethodIconBubbleStyle | string;
  sourceDirection?: string;
  /** Dims the frame when the parent tab is inactive. */
  active?: boolean;
  className?: string;
};

const THOUGHT_LAYOUT = buildComicBurstPath({
  width: 100,
  height: 112,
  kind: "thought",
  spikeCount: 12,
  randomness: 0.18,
  seedKey: "label-method-thought",
});

const POINTED_ARCS_LAYOUT = buildComicBurstPath({
  width: 100,
  height: 88,
  kind: "burst",
  spikeCount: 12,
  randomness: 0.18,
  seedKey: "label-method-pointed-arcs",
});

type FrameKey = "diamond" | "round" | "rect" | "thought" | "pointedArcs";

function frameClassKeyForStyle(bubbleStyle: string): FrameKey {
  if (bubbleStyle === "diamond") return "diamond";
  if (bubbleStyle === "thought") return "thought";
  if (bubbleStyle === "pointedArcs") return "pointedArcs";
  if (bubbleStyle === "circle") return "round";
  return "rect";
}

function frameClassForStyle(bubbleStyle: string): string {
  const key = frameClassKeyForStyle(bubbleStyle);
  if (key === "diamond") return styles.frameDiamond;
  if (key === "thought") return styles.frameThought;
  if (key === "pointedArcs") return styles.framePointedArcs;
  if (key === "round") return styles.frameRound;
  return styles.frameRect;
}

/**
 * Comic method icon with a static CSS bubble frame.
 * Avoids Comical.js single-edit-root races used by ShareMethodIcon.
 */
export function LabelMethodIcon({
  src,
  bubbleStyle = "rectangle",
  active = true,
  className,
}: LabelMethodIconProps) {
  const styleKey = String(bubbleStyle ?? "rectangle");
  const frameKey = frameClassKeyForStyle(styleKey);
  const frameClass = frameClassForStyle(styleKey);

  const burstOutline =
    frameKey === "thought"
      ? THOUGHT_LAYOUT
      : frameKey === "pointedArcs"
        ? POINTED_ARCS_LAYOUT
        : null;

  return (
    <div
      className={[
        styles.stage,
        active ? styles.active : styles.inactive,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={[styles.frame, frameClass].join(" ")}>
        {burstOutline ? (
          <svg
            className={styles.burstOutline}
            viewBox={`0 0 ${burstOutline.width} ${burstOutline.height}`}
            aria-hidden
          >
            <path d={burstOutline.d} fill="#111111" transform="translate(4 4)" />
            <path
              d={burstOutline.d}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="3.25"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
        <img src={src} alt="" className={styles.icon} draggable={false} />
      </div>
    </div>
  );
}
