import type { ReactNode, RefObject } from "react";
import type {
  TextBubbleDropDirection,
  TextBubbleTailDirection,
} from "./TextBubbleDropdown.types";

export type TextBubbleStageProps = {
  dropDirection: TextBubbleDropDirection;
  tailDirection: TextBubbleTailDirection;
  shellRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  bubbleReady: boolean;
  onBubblesReady: () => void;
  children: ReactNode;
};
