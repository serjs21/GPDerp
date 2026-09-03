import { styleUsesTail, type ComicBubbleStyle } from "@/components/ComicConfirmModal/comicBubblePresets";
import type { ComicSourceDirection } from "@/components/ComicConfirmModal/comicSourceDirection";

export type ComicLabelLayoutClasses = {
  contentBurst: string;
  contentSpeech: string;
  stageBurst: string;
  stageSpeech: string;
  stageTailBottom: string;
  stageTailTop: string;
  stageTailLeft: string;
  stageTailRight: string;
  stageCompact: string;
};

export function contentClassForBubbleStyle(
  style: ComicBubbleStyle,
  classes: Pick<ComicLabelLayoutClasses, "contentBurst" | "contentSpeech">,
): string {
  return styleUsesTail(style) ? classes.contentSpeech : classes.contentBurst;
}

export function stagePaddingClassForLabel(
  style: ComicBubbleStyle,
  direction: ComicSourceDirection,
  classes: ComicLabelLayoutClasses,
): string {
  if (!styleUsesTail(style)) {
    return classes.stageBurst;
  }

  switch (direction) {
    case "bottom":
    case "bottom-left":
    case "bottom-right":
      return classes.stageTailBottom;
    case "top":
    case "top-left":
    case "top-right":
      return classes.stageTailTop;
    case "left":
      return classes.stageTailLeft;
    case "right":
      return classes.stageTailRight;
    default:
      return classes.stageSpeech;
  }
}
