import type {
  LabelHaloAnchor,
  LabelHaloConnectionPointId,
} from "./labelHaloConnectionPoints";
import { DEFAULT_LABEL_HALO_CONNECTION_POINTS } from "./labelHaloConnectionPoints";

export {
  DEFAULT_LABEL_HALO_CONNECTION_POINTS,
  connectionPointInsetStyle,
  slotPositionStyle,
  transformOriginForConnection,
  type LabelHaloAnchor,
  type LabelHaloConnectionPoint,
  type LabelHaloConnectionPointId,
} from "./labelHaloConnectionPoints";

export const LABEL_HALO_CONNECTION_POINT_SRC = "/label_halo/connection_point.svg";
export const LABEL_HALO_ROTATE_ICON_SRC = "/label_halo/rotate_label.svg";

export const LABEL_SLOT_ROTATE_STEP_DEG = 5;

/** Max labels linked to one haiku (matches API HAIKU_LABELS_MAX). */
export const HAIKU_LABELS_MAX = 10;

/** Drop area padding around lantern content (CSS vars). */
export const LABEL_HALO_DROP_PAD_REM = 5;
/** Extra pad on top / left / right (not bottom). */
export const LABEL_HALO_DROP_PAD_EXTRA_REM = 8;

export type LabelHaloLabelItem = {
  id: string;
  name: string;
  color: string;
  shape?: string;
  /** 0–100 within the drop area (content + pad). */
  xPercent: number;
  /** 0–100 within the drop area (content + pad). */
  yPercent: number;
  rotateDeg: number;
  /** Which edge is the rotate axis. */
  connection?: LabelHaloAnchor;
};

export type LabelPlacement = {
  xPercent: number;
  yPercent: number;
  rotateDeg: number;
};

/** Map legacy connection-point ids to free % seeds for stories / migration. */
export function seedPlacementFromConnectionPoint(
  pointId: LabelHaloConnectionPointId,
): Pick<LabelPlacement, "xPercent" | "yPercent"> & { connection: LabelHaloAnchor } {
  const point =
    DEFAULT_LABEL_HALO_CONNECTION_POINTS.find((item) => item.id === pointId) ??
    DEFAULT_LABEL_HALO_CONNECTION_POINTS[0];
  const xPercent =
    point.left != null
      ? Math.min(100, Math.max(0, point.left))
      : Math.min(100, Math.max(0, 100 - (point.right ?? 0)));
  const yPercent = Math.min(100, Math.max(0, point.top));
  return { xPercent, yPercent, connection: point.connection };
}
