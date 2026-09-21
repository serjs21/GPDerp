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
