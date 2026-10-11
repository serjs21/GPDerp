import type { LabelBeltItem } from "./LabelBelt";
import type { LabelBeltSlot } from "./labelBeltLayout";

export type LabelBeltPortalTransition = {
  delta: 1 | -1;
  nextOffset: number;
  fromVisible: LabelBeltItem[];
  toVisible: LabelBeltItem[];
};

export type LabelBeltDisplaySlot = LabelBeltSlot & { out: LabelBeltItem; inn: LabelBeltItem | null };

export type LabelBeltLayer = "out" | "inn" | "stack";

export type LabelBeltSetLayerRef = (slotId: LabelBeltSlot["id"], layer: LabelBeltLayer, el: HTMLElement | null) => void;

export type LabelBeltBurstProps = {
  label: LabelBeltItem;
  /** Set while the label is puffing in; 0 starts immediately. */
  puffDelayMs?: number;
  onPuffEnd: () => void;
};

export type LabelBeltBlockProps = LabelBeltBurstProps & {
  slotId: LabelBeltSlot["id"];
  layer: "out" | "inn";
  setLayerRef: LabelBeltSetLayerRef;
};

export type LabelBeltSlotStackProps = {
  slot: LabelBeltDisplaySlot;
  /** Direction of the running portal wipe, or null when idle. */
  transitionDelta: 1 | -1 | null;
  setLayerRef: LabelBeltSetLayerRef;
  puffDelays: Record<string, number>;
  onPuffEnd: (labelId: string) => void;
};

export type LabelBeltNavProps = {
  disabled: boolean;
  onStep: (delta: 1 | -1) => void;
};
