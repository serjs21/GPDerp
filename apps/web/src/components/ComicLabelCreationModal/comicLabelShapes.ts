import type { ComicBurstShapeKind } from "@/components/ComicBurstLabel/comicBurstPath";

export type ComicLabelShapeId =
  | "classic"
  | "jagged"
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
  { id: "jagged", label: "Jagged", kind: "burst", spikeCount: 16, randomness: 0.28 },
  { id: "soft", label: "Soft", kind: "burst", spikeCount: 8, randomness: 0.1 },
  { id: "circle", label: "Circle", kind: "circle", spikeCount: 8, randomness: 0 },
  { id: "square", label: "Square", kind: "square", spikeCount: 8, randomness: 0 },
  { id: "thought", label: "Thought", kind: "thought", spikeCount: 12, randomness: 0.14 },
] as const;

export const COMIC_LABEL_NAME_MIN = 3;
export const COMIC_LABEL_NAME_MAX = 15;
