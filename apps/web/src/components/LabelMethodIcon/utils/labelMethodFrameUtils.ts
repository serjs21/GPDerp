import { buildComicBurstPath } from "@/components/ComicBurstLabel/comicBurstPath";
import styles from "../LabelMethodIcon.module.css";

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

const BURST_OUTLINE_BY_FRAME: Partial<Record<FrameKey, typeof THOUGHT_LAYOUT>> = {
  thought: THOUGHT_LAYOUT,
  pointedArcs: POINTED_ARCS_LAYOUT,
};

function frameKeyForStyle(bubbleStyle: string): FrameKey {
  if (bubbleStyle === "diamond") return "diamond";
  if (bubbleStyle === "thought") return "thought";
  if (bubbleStyle === "pointedArcs") return "pointedArcs";
  if (bubbleStyle === "circle") return "round";
  return "rect";
}

function frameClassForStyle(bubbleStyle: string): string {
  const key = frameKeyForStyle(bubbleStyle);
  if (key === "diamond") return styles.frameDiamond;
  if (key === "thought") return styles.frameThought;
  if (key === "pointedArcs") return styles.framePointedArcs;
  if (key === "round") return styles.frameRound;
  return styles.frameRect;
}

/** Frame class plus the comic-burst outline drawn behind thought / pointed-arc frames (null otherwise). */
export function resolveLabelMethodFrame(bubbleStyle: string) {
  const key = frameKeyForStyle(bubbleStyle);
  return {
    frameClass: frameClassForStyle(bubbleStyle),
    burstOutline: BURST_OUTLINE_BY_FRAME[key] ?? null,
  };
}
