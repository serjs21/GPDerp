import type { ComicBurstShapeKind } from "@/components/ComicBurstLabel/comicBurstPath";

export type ComicLabelShapeId =
  | "classic"
  | "sharp"
  | "soft"
  | "circle"
  | "square"
  | "thought";

export type ComicLabelShapePreset = {
  id: ComicLabelShapeId;
  label: string;
  kind: ComicBurstShapeKind;
  spikeCount: number;
  randomness: number;
};

export const COMIC_LABEL_SHAPE_PRESETS: readonly ComicLabelShapePreset[] = [
  { id: "classic", label: "Classic", kind: "burst", spikeCount: 12, randomness: 0.18 },
  { id: "sharp", label: "Sharp", kind: "rect", spikeCount: 0, randomness: 0 },
  { id: "soft", label: "Soft", kind: "burst", spikeCount: 8, randomness: 0.1 },
  { id: "circle", label: "Circle", kind: "circle", spikeCount: 8, randomness: 0 },
  { id: "square", label: "Square", kind: "square", spikeCount: 8, randomness: 0 },
  { id: "thought", label: "Thought", kind: "thought", spikeCount: 12, randomness: 0.14 },
] as const;

const PRESET_BY_ID = new Map(
  COMIC_LABEL_SHAPE_PRESETS.map((preset) => [preset.id, preset] as const),
);

/** Resolve a persisted shape id (or unknown) to a known preset; defaults to classic. */
export function resolveComicLabelShapePreset(shape?: string | null): ComicLabelShapePreset {
  if (shape && PRESET_BY_ID.has(shape as ComicLabelShapeId)) {
    return PRESET_BY_ID.get(shape as ComicLabelShapeId)!;
  }
  return COMIC_LABEL_SHAPE_PRESETS[0]!;
}

/** Silent silhouette chip in the shape picker (no visible lettering). */
export const COMIC_LABEL_SHAPE_PREVIEW_TEXT = "";

export const COMIC_LABEL_NAME_MIN = 3;
export const COMIC_LABEL_NAME_MAX = 15;
