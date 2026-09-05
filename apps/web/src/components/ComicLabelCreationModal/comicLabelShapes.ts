export type ComicLabelShapeId = "classic" | "jagged" | "soft";

export type ComicLabelShapePreset = {
  id: ComicLabelShapeId;
  label: string;
  spikeCount: number;
  randomness: number;
};

export const COMIC_LABEL_SHAPE_PRESETS: readonly ComicLabelShapePreset[] = [
  { id: "classic", label: "Classic", spikeCount: 12, randomness: 0.18 },
  { id: "jagged", label: "Jagged", spikeCount: 16, randomness: 0.28 },
  { id: "soft", label: "Soft", spikeCount: 8, randomness: 0.1 },
] as const;

export const COMIC_LABEL_NAME_MIN = 3;
export const COMIC_LABEL_NAME_MAX = 15;
