/** Belt-like fill order for default connection points on new haiku↔label links. */
export const HAIKU_LABEL_CONNECTION_FILL_ORDER = [
  "bl",
  "br",
  "mr",
  "tr",
  "tl",
  "ml",
] as const;

export type HaikuLabelConnectionPointId =
  (typeof HAIKU_LABEL_CONNECTION_FILL_ORDER)[number];

/** Default rotateDeg for each connection point (matches lantern belt stops). */
export const HAIKU_LABEL_DEFAULT_ROTATE_DEG: Record<
  HaikuLabelConnectionPointId,
  number
> = {
  bl: -22,
  br: 22,
  mr: 0,
  tr: -22,
  tl: 22,
  ml: 0,
};

export type HaikuLinkedLabel = {
  id: string;
  name: string;
  color: string;
  shape: string;
  connectionPointId: string;
  rotateDeg: number;
};

export const haikuLabelLinkSelect = {
  connectionPointId: true,
  rotateDeg: true,
  label: {
    select: {
      id: true,
      name: true,
      color: true,
      shape: true,
    },
  },
} as const;

export function mapHaikuLabelLinks(
  rows: Array<{
    connectionPointId: string;
    rotateDeg: number;
    label: { id: string; name: string; color: string; shape: string };
  }>,
): HaikuLinkedLabel[] {
  return rows.map((row) => ({
    id: row.label.id,
    name: row.label.name,
    color: row.label.color,
    shape: row.label.shape,
    connectionPointId: row.connectionPointId,
    rotateDeg: row.rotateDeg,
  }));
}

export function defaultPlacementForIndex(index: number): {
  connectionPointId: HaikuLabelConnectionPointId;
  rotateDeg: number;
} {
  const connectionPointId =
    HAIKU_LABEL_CONNECTION_FILL_ORDER[
      index % HAIKU_LABEL_CONNECTION_FILL_ORDER.length
    ]!;
  return {
    connectionPointId,
    rotateDeg: HAIKU_LABEL_DEFAULT_ROTATE_DEG[connectionPointId],
  };
}
