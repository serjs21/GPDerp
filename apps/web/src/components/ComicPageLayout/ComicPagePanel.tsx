"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  COMIC_PANEL_COLORS,
  type ComicPanelBackground,
  type ComicPanelColor,
} from "./comicPagePresets";
import panelStyles from "./ComicPagePanel.module.css";

export type ComicPagePanelProps = {
  children?: ReactNode;
  /** Comic caption box in the panel top-left corner. */
  title?: ReactNode;
  background?: ComicPanelBackground;
  color?: ComicPanelColor;
  /** Crossfade anime speed-line overlay on top of the static background. */
  loading?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  flexWeight?: number;
  span?: "auto" | "full";
  contentAlign?: "center" | "start";
  className?: string;
  ariaLabel?: string;
};

function panelStyleVars(color: ComicPanelColor): CSSProperties {
  const preset = COMIC_PANEL_COLORS[color];
  return {
    "--comic-panel-base": preset.base,
    "--comic-panel-accent": preset.accent ?? preset.base,
  } as CSSProperties;
}

function staticBgClass(background: ComicPanelBackground): string {
  if (background === "sunburst") return panelStyles.bgSunburst;
  if (background === "halftone") return panelStyles.bgHalftone;
  return panelStyles.bgSolid;
}

export function ComicPagePanel({
  children,
  title,
  background = "solid",
  color = "white",
  loading = false,
  selectable = false,
  selected = false,
  onSelect,
  flexWeight = 1,
  span = "auto",
  contentAlign = "center",
  className,
  ariaLabel,
}: ComicPagePanelProps) {
  const isMotionBackground = background === "motion";
  const showMotionOverlay = loading && !isMotionBackground;
  const bgClass = staticBgClass(isMotionBackground ? "solid" : background);

  const panelClass = [
    panelStyles.panel,
    span === "full" ? panelStyles.panelFull : panelStyles.panelAuto,
    selectable && panelStyles.panelSelectable,
    selected && panelStyles.panelSelected,
    loading && panelStyles.panelLoading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClass = [
    panelStyles.content,
    contentAlign === "start" && panelStyles.contentStart,
    contentAlign === "start" && panelStyles.contentStretch,
    title != null && title !== "" && contentAlign === "start" && panelStyles.contentWithTitle,
  ]
    .filter(Boolean)
    .join(" ");

  const titleLabel = typeof title === "string" ? title : null;

  const style = {
    ...panelStyleVars(color),
    ...(span === "auto" ? { "--comic-panel-flex": flexWeight } : {}),
  } as CSSProperties;

  const inner = (
    <>
      <div className={[panelStyles.bgLayer, bgClass].join(" ")} aria-hidden />
      {isMotionBackground ? (
        <div className={[panelStyles.bgLayer, panelStyles.bgMotion].join(" ")} aria-hidden />
      ) : null}
      {showMotionOverlay ? (
        <div className={[panelStyles.bgLayer, panelStyles.bgMotionOverlay].join(" ")} aria-hidden />
      ) : null}
      {title != null && title !== "" ? (
        <div className={panelStyles.panelTitle}>{titleLabel ?? title}</div>
      ) : null}
      <div className={contentClass}>{children}</div>
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        className={panelClass}
        style={style}
        aria-pressed={selected}
        aria-busy={loading}
        aria-label={ariaLabel}
        onClick={onSelect}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={panelClass} style={style} aria-busy={loading || undefined}>
      {inner}
    </div>
  );
}
