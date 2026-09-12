"use client";

import type { ReactNode } from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import styles from "./UserMenuBurstFrame.module.css";

export const USER_MENU_BURST_SIZE = 36;

export type UserMenuBurstFrameProps = {
  /** Burst seed / a11y context text. */
  label: string;
  className?: string;
  size?: number;
  /** Silhouette fill — cream for header chrome, white for option icons. */
  fill?: string;
  children: ReactNode;
};

/** Sharp comic-burst frame matching the UserMenu avatar trigger. */
export function UserMenuBurstFrame({
  label,
  className,
  size = USER_MENU_BURST_SIZE,
  fill = "var(--brush-option-icon-fill, #ffffff)",
  children,
}: UserMenuBurstFrameProps) {
  const sharpShape = resolveComicLabelShapePreset("sharp");

  return (
    <ComicBurstLabel
      className={`${styles.burst}${className ? ` ${className}` : ""}`}
      text={label}
      shapeKind={sharpShape.kind}
      spikeCount={sharpShape.spikeCount}
      randomness={sharpShape.randomness}
      seed={`${sharpShape.id}-${label}`}
      fontSize={size}
      paddingX={0}
      paddingY={0}
      strokeWidth={3}
      fill={fill}
    >
      {children}
    </ComicBurstLabel>
  );
}
