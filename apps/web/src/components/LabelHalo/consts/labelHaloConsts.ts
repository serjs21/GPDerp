import {
  LABEL_BELT_STOPS,
  type LabelBeltStop,
  type LabelBeltStopId,
  type LabelBeltStopSide,
} from "@/components/Lantern/config";

export type LabelHaloConnectionPointId = LabelBeltStopId;

export type LabelHaloConnectionPoint = {
  id: LabelHaloConnectionPointId;
  side: LabelBeltStopSide;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  defaultRotateDeg: number;
};

/** Default halo anchors — same insets/rotations as lantern belt stops. */
export const DEFAULT_LABEL_HALO_CONNECTION_POINTS: LabelHaloConnectionPoint[] =
  (Object.keys(LABEL_BELT_STOPS) as LabelBeltStopId[]).map((id) => {
    const stop: LabelBeltStop = LABEL_BELT_STOPS[id];
    return {
      id: stop.id,
      side: stop.side,
      top: stop.top,
      bottom: stop.bottom,
      left: stop.left,
      right: stop.right,
      defaultRotateDeg: stop.rotateDeg,
    };
  });

export const LABEL_HALO_CONNECTION_POINT_SRC = "/label_halo/connection_point.svg";

export const LABEL_SLOT_ROTATE_STEP_DEG = 5;

export function connectionPointInsetStyle(point: LabelHaloConnectionPoint): {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
} {
  return {
    ...(point.top != null ? { top: `${point.top}%` } : null),
    ...(point.bottom != null ? { bottom: `${point.bottom}%` } : null),
    ...(point.left != null ? { left: `${point.left}%` } : null),
    ...(point.right != null ? { right: `${point.right}%` } : null),
  };
}

export type LabelHaloLabelItem = {
  id: string;
  name: string;
  color: string;
  shape?: string;
  connectionPointId: string;
  rotateDeg: number;
};

export type LabelPlacement = {
  connectionPointId: string;
  rotateDeg: number;
};
