import type { CSSProperties } from "react";

export type DualityIconTone = "mask" | "strokeInvert" | "image";

export type DualityFaceIconPosition = "top" | "bottom" | "center";

export type DualityFaceIconProps = {
  src: string;
  position: DualityFaceIconPosition;
  /** `mask` tints the whole glyph; `strokeInvert` only flips black ink; `image` keeps authored colors. */
  tone?: DualityIconTone;
  /** Size multiplier vs the default end icons (center time glyph uses 2). */
  scale?: number;
};

/** One tone rendering of a face glyph at a resolved position/size. */
export type DualityToneIconProps = {
  src: string;
  placeClass: string;
  sizeStyle: CSSProperties | undefined;
};
