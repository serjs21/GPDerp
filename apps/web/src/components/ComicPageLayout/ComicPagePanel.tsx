"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
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
  const panelRef = useRef<HTMLElement | null>(null);

  // #region agent log
  useEffect(() => {
    if (background !== "sunburst") return;
    const el = panelRef.current;
    if (!el) return;

    const measure = () => {
      const bg = el.querySelector(`.${panelStyles.bgSunburst}`) as HTMLElement | null;
      const host = bg ?? el;
      const rect = host.getBoundingClientRect();
      const before = getComputedStyle(host, "::before");
      const beforeW = Number.parseFloat(before.width) || 0;
      const beforeH = Number.parseFloat(before.height) || 0;
      const diagonal = Math.hypot(rect.width, rect.height);
      const minSide = Math.min(beforeW, beforeH);
      const coversDiagonal = minSide >= diagonal - 0.5;
      const aspect = rect.width / Math.max(rect.height, 1);
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "53a752",
        },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix",
          hypothesisId: "A",
          location: "ComicPagePanel.tsx:sunburst-measure",
          message: "sunburst coverage geometry",
          data: {
            panelW: Math.round(rect.width * 10) / 10,
            panelH: Math.round(rect.height * 10) / 10,
            aspect: Math.round(aspect * 100) / 100,
            diagonal: Math.round(diagonal * 10) / 10,
            beforeW: Math.round(beforeW * 10) / 10,
            beforeH: Math.round(beforeH * 10) / 10,
            minSide: Math.round(minSide * 10) / 10,
            coversDiagonal,
            shortfall: Math.round((diagonal - minSide) * 10) / 10,
            beforeTransform: before.transform,
            beforeTranslate: before.translate,
            cssWidth: before.getPropertyValue("width"),
            cssHeight: before.getPropertyValue("height"),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [background, color, className]);
  // #endregion

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
        ref={panelRef as React.RefObject<HTMLButtonElement>}
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
    <div
      ref={panelRef as React.RefObject<HTMLDivElement>}
      className={panelClass}
      style={style}
      aria-busy={loading || undefined}
    >
      {inner}
    </div>
  );
}
