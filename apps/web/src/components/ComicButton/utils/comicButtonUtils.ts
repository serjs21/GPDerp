import type { CSSProperties, ReactNode } from "react";
import { stagePaddingClassForDirection } from "../../ComicConfirmModal/comicSourceDirection";
import stageStyles from "../../ComicConfirmModal/comicBubbleStage.module.css";
import {
  COMIC_PANEL_COLORS,
  type ComicPanelNamedColor,
} from "../../ComicPageLayout/comicPagePresets";
import type { ComicButtonProps } from "../ComicButton.types";
import styles from "../ComicButton.module.css";

function resolveFontColor(fontColor: ComicButtonProps["fontColor"]): string | undefined {
  if (!fontColor) return undefined;
  if (Object.prototype.hasOwnProperty.call(COMIC_PANEL_COLORS, fontColor)) {
    return COMIC_PANEL_COLORS[fontColor as ComicPanelNamedColor].base;
  }
  return fontColor;
}

/** Button inline style plus the resolved label color (also part of the comical targets key). */
export function comicButtonAppearance(
  style: CSSProperties | undefined,
  fontColor: ComicButtonProps["fontColor"],
) {
  const color = resolveFontColor(fontColor);
  return {
    color,
    style: color ? ({ ...style, color } as CSSProperties) : style,
  };
}

/** Comical recalculates when this changes: bubble shape, tail, label, fills, label color. */
export function comicButtonTargetsKey(params: {
  bubbleStyle: string;
  sourceDirection: string;
  children: ReactNode;
  backgroundColors?: string[];
  color?: string;
}): string {
  const labelKey = typeof params.children === "string" ? params.children : "node";
  const colorsKey = params.backgroundColors?.join(",") ?? "";
  return `btn:${params.bubbleStyle}:${params.sourceDirection}:${labelKey}:${colorsKey}:${params.color ?? ""}`;
}

export function comicButtonStageClassName(
  sourceDirection: NonNullable<ComicButtonProps["sourceDirection"]>,
  className?: string,
): string {
  const stagePaddingClass = stagePaddingClassForDirection(sourceDirection, {
    stageTailBottom: styles.stageTailBottom,
    stageTailTop: styles.stageTailTop,
    stageTailLeft: styles.stageTailLeft,
    stageTailRight: styles.stageTailRight,
    stageCompact: styles.stageCompact,
  });
  return [stageStyles.stage, styles.stageStandalone, stagePaddingClass, className]
    .filter(Boolean)
    .join(" ");
}
