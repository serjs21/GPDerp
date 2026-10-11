import type { RefObject } from "react";
import type { LabelHaloLabelItem, LabelPlacement } from "./consts/labelHaloConsts";

export type DraggableLabelProps = {
  label: LabelHaloLabelItem;
  rotateDeg: number;
  isDragging: boolean;
  interactive: boolean;
  dropRef: RefObject<HTMLDivElement | null>;
  outlineRef: RefObject<SVGSVGElement | null>;
  onDragActiveChange: (labelId: string, active: boolean) => void;
  onPositionDraft: (labelId: string, xPercent: number, yPercent: number) => void;
  onRotateDraft: (labelId: string, rotateDeg: number) => void;
  onPlacementCommit: (labelId: string, placement: LabelPlacement) => void;
  puffDelayMs?: number;
  onPuffEnd?: () => void;
};
