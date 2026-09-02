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
  background?: ComicPanelBackground;
  color?: ComicPanelColor;
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

export function ComicPagePanel({
  children,
  background = "solid",
  color = "white",
  selectable = false,
  selected = false,
  onSelect,
  flexWeight = 1,
  span = "auto",
  contentAlign = "center",
  className,
  ariaLabel,
}: ComicPagePanelProps) {
  const bgClass =
    background === "sunburst"
      ? panelStyles.bgSunburst
      : background === "halftone"
        ? panelStyles.bgHalftone
        : panelStyles.bgSolid;

  const panelClass = [
    panelStyles.panel,
    span === "full" ? panelStyles.panelFull : panelStyles.panelAuto,
    selectable && panelStyles.panelSelectable,
    selected && panelStyles.panelSelected,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClass = [
    panelStyles.content,
    contentAlign === "start" && panelStyles.contentStart,
    contentAlign === "start" && panelStyles.contentStretch,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...panelStyleVars(color),
    ...(span === "auto" ? { "--comic-panel-flex": flexWeight } : {}),
  } as CSSProperties;

  const inner = (
    <>
      <div className={[panelStyles.bgLayer, bgClass].join(" ")} aria-hidden />
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
        aria-label={ariaLabel}
        onClick={onSelect}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={panelClass} style={style}>
      {inner}
    </div>
  );
}
