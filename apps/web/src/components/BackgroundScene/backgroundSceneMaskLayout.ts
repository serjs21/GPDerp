/** Shared source width for base art and luminance masks. */
export const BACKGROUND_SCENE_SOURCE_WIDTH = 1672;

/** Floor for rendered base-art width; narrower viewports crop sides instead of shrinking. */
export const BACKGROUND_SCENE_MIN_DISPLAY_WIDTH = 1100;

export const BACKGROUND_SCENE_SOURCE_SIZE = {
  baseWidth: BACKGROUND_SCENE_SOURCE_WIDTH,
  baseHeight: 518,
  maskWidth: BACKGROUND_SCENE_SOURCE_WIDTH,
  maskHeight: 941,
} as const;

export type BackgroundSceneMaskLayout = {
  scale: number;
  maskWidthPx: number;
  maskHeightPx: number;
  maskPosition: string;
};

/** Scale mask dimensions from the rendered base-art width (width-locked). */
export function backgroundSceneMaskLayout(displayWidth: number): BackgroundSceneMaskLayout {
  const { baseWidth, maskHeight } = BACKGROUND_SCENE_SOURCE_SIZE;
  const scale = displayWidth / baseWidth;

  return {
    scale,
    maskWidthPx: displayWidth,
    maskHeightPx: maskHeight * scale,
    maskPosition: "center bottom",
  };
}
