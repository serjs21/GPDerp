"use client";

import { withDefaults } from "@/utils/props/withDefaults";
import type { ComicPagePanelProps } from "./ComicPagePanel.types";
import { PanelBackgroundLayers } from "./PanelBackgroundLayers";
import { useFineBands } from "./useFineBands";
import {
  hasCaption,
  panelClassName,
  panelContentClassName,
  panelStyle,
  panelTitleClassName,
  resolvePanelBackground,
} from "./utils/comicPagePanelUtils";
import panelStyles from "./ComicPagePanel.module.css";

export type { ComicPagePanelProps, ComicPanelTitleDirection } from "./ComicPagePanel.types";

const COMIC_PAGE_PANEL_DEFAULTS = {
  titleDirection: "horizontal",
  titleColor: "white",
  footerColor: "white",
  background: "solid",
  color: "white",
  loading: false,
  shine: false,
  selectable: false,
  selected: false,
  flexWeight: 1,
  span: "auto",
  contentAlign: "center",
  overflowVisible: false,
} as const;

export function ComicPagePanel(props: ComicPagePanelProps) {
  const panel = withDefaults(props, COMIC_PAGE_PANEL_DEFAULTS);
  const { children, title, footer, onSelect, ariaLabel, className, style } = props;
  const backgroundMode = resolvePanelBackground(panel.background, props.isMotionBackground);
  const fineBands = useFineBands(backgroundMode.isFine);
  const hasTitle = hasCaption(title);
  const hasFooter = hasCaption(footer);

  const body = (
    <>
      <PanelBackgroundLayers
        mode={backgroundMode}
        fineBands={fineBands}
        shine={panel.shine}
        loading={panel.loading}
      />
      {hasTitle ? <div className={panelTitleClassName(panel.titleDirection)}>{title}</div> : null}
      <div className={panelContentClassName(panel, hasTitle, hasFooter)}>{children}</div>
      {hasFooter ? <div className={panelStyles.panelFooter}>{footer}</div> : null}
    </>
  );

  if (panel.selectable) {
    return (
      <button
        type="button"
        className={panelClassName(panel, className)}
        style={panelStyle(panel, style)}
        aria-pressed={panel.selected}
        aria-busy={panel.loading}
        aria-label={ariaLabel}
        onClick={onSelect}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      className={panelClassName(panel, className)}
      style={panelStyle(panel, style)}
      aria-busy={panel.loading || undefined}
    >
      {body}
    </div>
  );
}
