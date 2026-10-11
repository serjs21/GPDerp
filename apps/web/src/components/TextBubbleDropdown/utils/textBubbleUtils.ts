import stageStyles from "@/components/ComicConfirmModal/comicBubbleStage.module.css";
import { stagePaddingClassForDirection } from "@/components/ComicConfirmModal/comicSourceDirection";
import styles from "../TextBubbleDropdown.module.css";
import { DROP_PANEL_CLASS } from "../consts/textBubbleConsts";
import type {
  TextBubbleDropDirection,
  TextBubbleOption,
  TextBubbleTailDirection,
} from "../TextBubbleDropdown.types";

export function textBubbleTriggerLabel(
  options: TextBubbleOption[],
  value: string | null,
  placeholder: string,
): string {
  return options.find((option) => option.value === value)?.label ?? placeholder;
}

export function textBubbleRootClassName(open: boolean, className?: string): string {
  return [styles.root, open ? styles.rootOpen : null, className].filter(Boolean).join(" ");
}

export function textBubblePanelClassName(
  dropDirection: TextBubbleDropDirection,
  open: boolean,
  bubbleReady: boolean,
): string {
  return [
    styles.panel,
    DROP_PANEL_CLASS[dropDirection],
    open ? null : styles.panelClosed,
    open && !bubbleReady ? styles.panelAwaitingBubble : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function textBubbleStageClassName(tailDirection: TextBubbleTailDirection): string {
  const stagePaddingClass = stagePaddingClassForDirection(tailDirection, {
    stageTailBottom: styles.stageTailBottom,
    stageTailTop: styles.stageTailTop,
    stageTailLeft: styles.stageTailLeft,
    stageTailRight: styles.stageTailRight,
    stageCompact: styles.stageCompact,
  });
  return [stageStyles.stage, styles.stage, stagePaddingClass].filter(Boolean).join(" ");
}
