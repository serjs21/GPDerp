import type { CSSProperties, ReactNode } from "react";
import panelStyles from "../ComicPagePanel.module.css";
import type { ComicPagePanelProps, ComicPanelBackgroundMode } from "../ComicPagePanel.types";
import { resolveComicPanelColor, type ComicPanelBackground, type ComicPanelColor } from "../comicPagePresets";

type PanelProps = Required<
  Pick<
    ComicPagePanelProps,
    | "titleDirection"
    | "titleColor"
    | "footerColor"
    | "color"
    | "loading"
    | "selectable"
    | "selected"
    | "flexWeight"
    | "span"
    | "contentAlign"
    | "overflowVisible"
  >
>;

/** Captions render for any node except `null` / `undefined` / `""`. */
export function hasCaption(node: ReactNode): boolean {
  return node != null && node !== "";
}

/** Motion wins over the static background; `fine` is only fine when not in motion mode. */
export function resolvePanelBackground(
  background: ComicPanelBackground,
  isMotionBackgroundProp: boolean | undefined,
): ComicPanelBackgroundMode {
  const isMotion = isMotionBackgroundProp ?? background === "motion";
  const isFine = background === "fine" && !isMotion;
  const resolved: ComicPanelBackground =
    isMotion || background === "motion" || (background === "fine" && !isFine) ? "solid" : background;
  return { isMotion, isFine, resolved };
}

function staticBgClass(background: ComicPanelBackground): string {
  if (background === "sunburst" || background === "sunburstHalftone") {
    return panelStyles.bgSunburst;
  }
  if (background === "halftone") return panelStyles.bgHalftone;
  if (background === "fine") return panelStyles.bgFine;
  return panelStyles.bgSolid;
}

/** Static fill class: fine, fine fading out (bands still exiting), or the resolved static background. */
export function panelBackgroundClass(
  mode: ComicPanelBackgroundMode,
  fineBandsVisible: boolean,
  shine: boolean,
): string {
  const { resolved } = mode;
  const fillClass = mode.isFine
    ? panelStyles.bgFine
    : fineBandsVisible
      ? panelStyles.bgFineExit
      : staticBgClass(resolved === "fine" ? "solid" : resolved);
  const isSunburst = resolved === "sunburst" || resolved === "sunburstHalftone";
  return [
    panelStyles.bgLayer,
    fillClass,
    isSunburst && shine && panelStyles.bgSunburstShine,
    resolved === "sunburstHalftone" && panelStyles.bgSunburstHalftone,
  ]
    .filter(Boolean)
    .join(" ");
}

export function panelClassName(
  props: Pick<PanelProps, "span" | "selectable" | "selected" | "loading" | "overflowVisible">,
  className?: string,
): string {
  return [
    panelStyles.panel,
    props.span === "full" ? panelStyles.panelFull : panelStyles.panelAuto,
    props.selectable && panelStyles.panelSelectable,
    props.selected && panelStyles.panelSelected,
    props.loading && panelStyles.panelLoading,
    props.overflowVisible && panelStyles.panelOverflowVisible,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function panelContentClassName(
  props: Pick<PanelProps, "contentAlign" | "titleDirection">,
  hasTitle: boolean,
  hasFooter: boolean,
): string {
  const alignStart = props.contentAlign === "start";
  const titleIsVertical = props.titleDirection === "vertical";
  return [
    panelStyles.content,
    alignStart && panelStyles.contentStart,
    alignStart && panelStyles.contentStretch,
    hasTitle && !titleIsVertical && alignStart && panelStyles.contentWithTitle,
    hasTitle && titleIsVertical && panelStyles.contentWithTitleVertical,
    hasFooter && alignStart && panelStyles.contentWithFooter,
  ]
    .filter(Boolean)
    .join(" ");
}

export function panelTitleClassName(titleDirection: PanelProps["titleDirection"]): string {
  return [panelStyles.panelTitle, titleDirection === "vertical" ? panelStyles.panelTitleVertical : ""]
    .filter(Boolean)
    .join(" ");
}

/** Panel/title/footer color variables, flex weight for auto-span panels, then caller overrides. */
export function panelStyle(
  props: Pick<PanelProps, "color" | "titleColor" | "footerColor" | "span" | "flexWeight">,
  style?: CSSProperties,
): CSSProperties {
  const panelColor = resolveComicPanelColor(props.color as ComicPanelColor);
  return {
    "--comic-panel-base": panelColor.base,
    "--comic-panel-accent": panelColor.accent,
    "--comic-title-bg": resolveComicPanelColor(props.titleColor).base,
    "--comic-footer-bg": resolveComicPanelColor(props.footerColor).base,
    ...(props.span === "auto" ? { "--comic-panel-flex": props.flexWeight } : {}),
    ...style,
  } as CSSProperties;
}
