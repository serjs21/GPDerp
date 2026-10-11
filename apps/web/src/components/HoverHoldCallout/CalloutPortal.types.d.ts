import type { ReactNode } from "react";
import type { AnchorBox } from "./useViewportAnchor";
import type { CalloutPosition } from "./utils/calloutPositionUtils";

export type CalloutPortalProps = {
  anchor: AnchorBox;
  visible: boolean;
  fadeMs: number;
  position: CalloutPosition;
  className?: string;
  children: ReactNode;
};
