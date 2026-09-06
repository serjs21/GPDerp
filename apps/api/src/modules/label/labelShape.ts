/** Comic label silhouette preset ids persisted on Label.shape. */
export const LABEL_SHAPE_IDS = [
  "classic",
  "sharp",
  "soft",
  "circle",
  "square",
  "thought",
] as const;

export type LabelShapeId = (typeof LABEL_SHAPE_IDS)[number];

export const DEFAULT_LABEL_SHAPE: LabelShapeId = "classic";

const LABEL_SHAPE_SET = new Set<string>(LABEL_SHAPE_IDS);

/** Coerce unknown / missing values to a known preset id (safe for old clients). */
export function normalizeLabelShape(shape?: string | null): LabelShapeId {
  const trimmed = (shape ?? "").trim();
  if (LABEL_SHAPE_SET.has(trimmed)) return trimmed as LabelShapeId;
  return DEFAULT_LABEL_SHAPE;
}
