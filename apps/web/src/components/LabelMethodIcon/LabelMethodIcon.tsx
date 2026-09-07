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
};

const THOUGHT_LAYOUT = buildComicBurstPath({
  width: 100,
  height: 88,
  kind: "thought",
  spikeCount: 10,
  randomness: 0.14,
  seedKey: "label-method-thought",
});

function frameClassKeyForStyle(bubbleStyle: string): "diamond" | "round" | "rect" | "thought" {
  if (bubbleStyle === "diamond") return "diamond";
  if (bubbleStyle === "thought") return "thought";
  if (bubbleStyle === "circle") return "round";
  return "rect";
}

function frameClassForStyle(bubbleStyle: string): string {
  const key = frameClassKeyForStyle(bubbleStyle);
  if (key === "diamond") return styles.frameDiamond;
  if (key === "thought") return styles.frameThought;
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
}: LabelMethodIconProps) {
  const styleKey = String(bubbleStyle ?? "rectangle");
  const frameKey = frameClassKeyForStyle(styleKey);
  const frameClass = frameClassForStyle(styleKey);
  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "320659",
    },
    body: JSON.stringify({
      sessionId: "320659",
      runId: "post-fix",
      hypothesisId: "A",
      location: "LabelMethodIcon.tsx:render",
      message: "bubble style resolve",
      data: {
        bubbleStyle: styleKey,
        frameKey,
        thoughtMapsToRound: styleKey === "thought" && frameClass === styles.frameRound,
        thoughtMapsToThought: styleKey === "thought" && frameClass === styles.frameThought,
        circleMapsToRound: styleKey === "circle" && frameClass === styles.frameRound,
        frameClassDefined: Boolean(frameClass),
        hasDistinctThoughtClass: Boolean(
          (styles as Record<string, string | undefined>).frameThought,
        ),
        src,
        active,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return (
    <div
      className={[styles.stage, active ? styles.active : styles.inactive].filter(Boolean).join(" ")}
      data-bubble-style={styleKey}
      data-frame-key={frameKey}
    >
      <div className={[styles.frame, frameClass].join(" ")}>
        {frameKey === "thought" ? (
          <svg
            className={styles.thoughtOutline}
            viewBox={`0 0 ${THOUGHT_LAYOUT.width} ${THOUGHT_LAYOUT.height}`}
            aria-hidden
          >
            <path d={THOUGHT_LAYOUT.d} fill="#111111" transform="translate(4 4)" />
            <path
              d={THOUGHT_LAYOUT.d}
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
