"use client";

import { withDefaults } from "@/utils/props/withDefaults";
import { DualityImageIcon } from "./DualityImageIcon";
import { DualityMaskIcon } from "./DualityMaskIcon";
import { DualityStrokeIcon } from "./DualityStrokeIcon";
import type { DualityFaceIconProps } from "./DualityFaceIcon.types";
import { dualityIconPositionClass, dualityIconSizeStyle } from "./utils/dualityFaceIconUtils";
import styles from "./DualityButton.module.css";

export type {
  DualityFaceIconPosition,
  DualityFaceIconProps,
  DualityIconTone,
} from "./DualityFaceIcon.types";

const DUALITY_FACE_ICON_DEFAULTS = { tone: "mask", scale: 1 } as const;

export function DualityFaceIcon(props: DualityFaceIconProps) {
  const { src, position, tone, scale } = withDefaults(props, DUALITY_FACE_ICON_DEFAULTS);
  const placeClass = dualityIconPositionClass(styles, position);
  const sizeStyle = dualityIconSizeStyle(scale);

  if (tone === "image") return <DualityImageIcon src={src} placeClass={placeClass} sizeStyle={sizeStyle} />;
  if (tone === "strokeInvert") {
    return <DualityStrokeIcon src={src} placeClass={placeClass} sizeStyle={sizeStyle} />;
  }
  return <DualityMaskIcon src={src} placeClass={placeClass} sizeStyle={sizeStyle} />;
}
