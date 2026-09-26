"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  resolveComicPanelColor,
  type ComicPanelBackground,
  type ComicPanelColor,
} from "./comicPagePresets";
import panelStyles from "./ComicPagePanel.module.css";
import { FinePatternTiles } from "./FinePatternTiles";

const FINE_CLOUD_SRC = "/fine_panel/fine_cloud_pattern.svg";
const FINE_FLAME_SRC = "/fine_panel/fine_flame_pattern.svg";
const FINE_BAND_EXIT_MS = 1000;

export type ComicPanelTitleDirection = "horizontal" | "vertical";

export type ComicPagePanelProps = {
  children?: ReactNode;
  /** Comic caption box in the panel top-left corner. */
  title?: ReactNode;
  /**
   * Title caption layout.
   * - `horizontal` (default): top-left corner chip
   * - `vertical`: left-edge spine; text reads bottom → top (see sort panels)
   */
  titleDirection?: ComicPanelTitleDirection;
  /** Background color for the title caption box. Defaults to white. */
  titleColor?: ComicPanelColor;
  /** Comic caption box in the panel bottom-right corner. */
  footer?: ReactNode;
  /** Background color for the footer caption box. Defaults to white. */
  footerColor?: ComicPanelColor;
  background?: ComicPanelBackground;
  color?: ComicPanelColor;
  /**
   * Show the anime speed-line motion background.
   * Defaults to true when `background` is `"motion"`.
   */
  isMotionBackground?: boolean;
  /** Crossfade anime speed-line overlay on top of the static background. */
  loading?: boolean;
  /** When background is sunburst / sunburstHalftone, rotate rays. Default false. */
  shine?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  flexWeight?: number;
  span?: "auto" | "full";
  contentAlign?: "center" | "start";
  className?: string;
  ariaLabel?: string;
  /** Allow bubble/canvas spikes to paint outside the panel border. */
  overflowVisible?: boolean;
  /** Merged after panel color CSS variables (e.g. override `--comic-panel-base`). */
  style?: CSSProperties;
};

function panelStyleVars(color: ComicPanelColor): CSSProperties {
  const resolved = resolveComicPanelColor(color);
  return {
    "--comic-panel-base": resolved.base,
    "--comic-panel-accent": resolved.accent,
  } as CSSProperties;
}

function staticBgClass(background: ComicPanelBackground): string {
  if (background === "sunburst" || background === "sunburstHalftone") {
    return panelStyles.bgSunburst;
  }
  if (background === "halftone") return panelStyles.bgHalftone;
  if (background === "fine") return panelStyles.bgFine;
  return panelStyles.bgSolid;
}

export function ComicPagePanel({
  children,
  title,
  titleDirection = "horizontal",
  titleColor = "white",
  footer,
  footerColor = "white",
  background = "solid",
  color = "white",
  isMotionBackground: isMotionBackgroundProp,
  loading = false,
  shine = false,
  selectable = false,
  selected = false,
  onSelect,
  flexWeight = 1,
  span = "auto",
  contentAlign = "center",
  className,
  ariaLabel,
  overflowVisible = false,
  style: styleProp,
}: ComicPagePanelProps) {
  const isMotionBackground = isMotionBackgroundProp ?? background === "motion";
  const showMotionOverlay = loading && !isMotionBackground;
  const isFineBackground = background === "fine" && !isMotionBackground;
  const [fineBandsVisible, setFineBandsVisible] = useState(isFineBackground);
  const [fineBandsExiting, setFineBandsExiting] = useState(false);

  useEffect(() => {
    if (isFineBackground) {
      setFineBandsVisible(true);
      setFineBandsExiting(false);
      return;
    }
    if (!fineBandsVisible) return;

    setFineBandsExiting(true);
    const timer = window.setTimeout(() => {
      setFineBandsVisible(false);
      setFineBandsExiting(false);
    }, FINE_BAND_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isFineBackground, fineBandsVisible]);

  const hasTitle = title != null && title !== "";
  const hasFooter = footer != null && footer !== "";
  const resolvedBackground =
    isMotionBackground || background === "motion"
      ? "solid"
      : background === "fine" && !isFineBackground
        ? "solid"
        : background;
  const isSunburst =
    resolvedBackground === "sunburst" || resolvedBackground === "sunburstHalftone";
  const fillClass = isFineBackground
    ? panelStyles.bgFine
    : fineBandsVisible
      ? panelStyles.bgFineExit
      : staticBgClass(resolvedBackground === "fine" ? "solid" : resolvedBackground);
  const bgClass = [
    fillClass,
    isSunburst && shine && panelStyles.bgSunburstShine,
    resolvedBackground === "sunburstHalftone" && panelStyles.bgSunburstHalftone,
  ]
    .filter(Boolean)
    .join(" ");

  const panelClass = [
    panelStyles.panel,
    span === "full" ? panelStyles.panelFull : panelStyles.panelAuto,
    selectable && panelStyles.panelSelectable,
    selected && panelStyles.panelSelected,
    loading && panelStyles.panelLoading,
    overflowVisible && panelStyles.panelOverflowVisible,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const titleIsVertical = titleDirection === "vertical";

  const contentClass = [
    panelStyles.content,
    contentAlign === "start" && panelStyles.contentStart,
    contentAlign === "start" && panelStyles.contentStretch,
    hasTitle &&
      !titleIsVertical &&
      contentAlign === "start" &&
      panelStyles.contentWithTitle,
    hasTitle && titleIsVertical && panelStyles.contentWithTitleVertical,
    hasFooter && contentAlign === "start" && panelStyles.contentWithFooter,
  ]
    .filter(Boolean)
    .join(" ");

  const titleLabel = typeof title === "string" ? title : null;
  const footerLabel = typeof footer === "string" ? footer : null;

  const style = {
    ...panelStyleVars(color),
    "--comic-title-bg": resolveComicPanelColor(titleColor).base,
    "--comic-footer-bg": resolveComicPanelColor(footerColor).base,
    ...(span === "auto" ? { "--comic-panel-flex": flexWeight } : {}),
    ...styleProp,
  } as CSSProperties;

  const titleClass = [
    panelStyles.panelTitle,
    titleIsVertical ? panelStyles.panelTitleVertical : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div className={[panelStyles.bgLayer, bgClass].join(" ")} aria-hidden />
      {isMotionBackground ? (
        <div className={[panelStyles.bgLayer, panelStyles.bgMotion].join(" ")} aria-hidden />
      ) : null}
      {showMotionOverlay ? (
        <div className={[panelStyles.bgLayer, panelStyles.bgMotionOverlay].join(" ")} aria-hidden />
      ) : null}
      {fineBandsVisible ? (
        <div className={panelStyles.fineBandsClip} aria-hidden>
          <div
            className={[
              panelStyles.fineCloudBand,
              fineBandsExiting ? panelStyles.fineCloudBandExit : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <FinePatternTiles src={FINE_CLOUD_SRC} />
          </div>
          <div
            className={[
              panelStyles.fineFlameBand,
              fineBandsExiting ? panelStyles.fineFlameBandExit : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <FinePatternTiles src={FINE_FLAME_SRC} />
          </div>
        </div>
      ) : null}
      {hasTitle ? (
        <div className={titleClass}>{titleLabel ?? title}</div>
      ) : null}
      <div className={contentClass}>{children}</div>
      {hasFooter ? (
        <div className={panelStyles.panelFooter}>{footerLabel ?? footer}</div>
      ) : null}
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
