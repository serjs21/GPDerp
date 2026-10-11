import type { HaikuActionSlotFaceProps } from "./HaikuActions.types";
import { slotFaceClassName } from "./utils/haikuActionsUtils";
import styles from "./HaikuActions.module.css";

/** One stacked face in an action slot (icon, or the action name sliding in from a side). */
export function HaikuActionSlotFace({ hidden, enterFrom, children }: HaikuActionSlotFaceProps) {
  return (
    <span className={slotFaceClassName(styles, enterFrom, hidden)} aria-hidden={hidden || undefined}>
      {children}
    </span>
  );
}
