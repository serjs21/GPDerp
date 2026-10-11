import { PANEL_HOVER_CLASS_KEYS } from "../consts/haikuActionsConsts";
import type { HaikuActionSlotFaceProps, HoverTarget } from "../HaikuActions.types";

export function panelHoverClass(styles: Record<string, string>, hover: HoverTarget): string {
  if (!hover) return "";
  return styles[PANEL_HOVER_CLASS_KEYS[hover]];
}

export function slotFaceClassName(
  styles: Record<string, string>,
  enterFrom: HaikuActionSlotFaceProps["enterFrom"],
  hidden: boolean | undefined,
): string {
  return [
    styles.slotFace,
    enterFrom === "left" ? styles.slotFaceFromLeft : "",
    enterFrom === "right" ? styles.slotFaceFromRight : "",
    hidden ? styles.slotFaceHidden : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function clapBurstClassName(styles: Record<string, string>, fading: boolean): string {
  return [styles.clapBurst, fading ? styles.clapBurstFade : ""].filter(Boolean).join(" ");
}
