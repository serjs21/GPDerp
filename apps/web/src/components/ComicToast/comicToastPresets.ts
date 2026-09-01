import type { ComicBubbleStyle } from "@/components/ComicConfirmModal/comicBubblePresets";

export type ComicToastTone = "success" | "error" | "warning" | "info";

export const COMIC_TOAST_DEFAULT_DURATION_MS = 3200;
export const COMIC_TOAST_MAX_VISIBLE = 3;
export const COMIC_TOAST_ENTER_OFFSET_REM = 0.75;

export type ComicToastTonePreset = {
  tone: ComicToastTone;
  bubbleStyle: ComicBubbleStyle;
  backgroundColors: string[];
};

export const COMIC_TOAST_TONE_PRESETS: Record<ComicToastTone, ComicToastTonePreset> = {
  info: {
    tone: "info",
    bubbleStyle: "caption",
    backgroundColors: ["#ffffff", "#e8f4fc"],
  },
  success: {
    tone: "success",
    bubbleStyle: "caption",
    backgroundColors: ["#fff9c4", "#ffe082"],
  },
  warning: {
    tone: "warning",
    bubbleStyle: "rectangle",
    backgroundColors: ["#ffe0b2"],
  },
  error: {
    tone: "error",
    bubbleStyle: "rectangle",
    backgroundColors: ["#ffcdd2", "#ef9a9a"],
  },
};

export function getComicToastPreset(tone: ComicToastTone): ComicToastTonePreset {
  return COMIC_TOAST_TONE_PRESETS[tone];
}
