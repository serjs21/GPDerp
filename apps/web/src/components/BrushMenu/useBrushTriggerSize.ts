"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { BrushMenuOption, BrushMenuProps } from "./BrushMenu.types";
import { BRUSH_TRIGGER_FALLBACK_SIZE_PX } from "./consts/brushMenuConsts";
import { BRUSH_OPTION_MIN_WIDTH_REM } from "./brushRevealPaths";
import type { BrushTriggerSizePx } from "./useBrushMenuDrawAnimation";
import styles from "./BrushMenu.module.css";

/**
 * In-flow footprint of a brush trigger: measures the closed size while the panel is unmounted, pins
 * the shell to it when opening (the draw animation then grows it), and tracks the full paint height
 * so the absolute panel sits underneath.
 */
export function useBrushTriggerSize(params: {
  rootRef: RefObject<HTMLDivElement | null>;
  triggerBrush: boolean;
  open: boolean;
  closing: boolean;
  panelMounted: boolean;
  /** Re-measure inputs (trigger content) and re-read paint height when rows change. */
  expandLabel: BrushMenuProps["expandLabel"];
  renderTrigger: BrushMenuProps["renderTrigger"];
  displayedOptions: BrushMenuOption[];
}) {
  const { rootRef, triggerBrush, open, closing, panelMounted, expandLabel, renderTrigger, displayedOptions } =
    params;
  const shellRef = useRef<HTMLDivElement>(null);
  const closedTriggerSizeRef = useRef<BrushTriggerSizePx>({
    width: BRUSH_TRIGGER_FALLBACK_SIZE_PX,
    height: BRUSH_TRIGGER_FALLBACK_SIZE_PX,
  });
  const [paintOpenHeightPx, setPaintOpenHeightPx] = useState<number | null>(null);

  const captureClosedTriggerSize = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const prevW = shell.style.width;
    const prevH = shell.style.height;
    shell.style.width = "";
    shell.style.height = "";
    closedTriggerSizeRef.current = {
      width: shell.offsetWidth || BRUSH_TRIGGER_FALLBACK_SIZE_PX,
      height: shell.offsetHeight || BRUSH_TRIGGER_FALLBACK_SIZE_PX,
    };
    shell.style.width = prevW;
    shell.style.height = prevH;
  }, []);

  useLayoutEffect(() => {
    if (panelMounted || !triggerBrush) return;
    captureClosedTriggerSize();
  }, [panelMounted, triggerBrush, expandLabel, renderTrigger, captureClosedTriggerSize]);

  useLayoutEffect(() => {
    if (!triggerBrush || !open || closing) return;
    const shell = shellRef.current;
    if (!shell || shell.style.width) return;
    const closed = closedTriggerSizeRef.current;
    // In-flow footprint: width starts closed; height stays avatar-sized.
    shell.style.width = `${closed.width}px`;
    shell.style.height = `${closed.height}px`;
  }, [open, closing, triggerBrush]);

  // Position absolute panel under the full paint height as soon as options mount.
  useLayoutEffect(() => {
    if (!triggerBrush || !panelMounted) return;
    const option = rootRef.current?.querySelector<HTMLElement>("[data-brush-option]");
    if (option) setPaintOpenHeightPx(option.offsetHeight);
  }, [rootRef, triggerBrush, panelMounted, displayedOptions]);

  const getClosedTriggerSizePx = useCallback(() => closedTriggerSizeRef.current, []);

  const getOpenTriggerSizePx = useCallback((): BrushTriggerSizePx => {
    const root = rootRef.current;
    const option = root?.querySelector<HTMLElement>("[data-brush-option]");
    const panel = root?.querySelector<HTMLElement>(`.${styles.panel}`);
    const width =
      option?.offsetWidth ||
      panel?.offsetWidth ||
      Math.max(closedTriggerSizeRef.current.width, BRUSH_OPTION_MIN_WIDTH_REM * 16);
    const height = option?.offsetHeight || closedTriggerSizeRef.current.height;
    return { width, height };
  }, [rootRef]);

  return {
    shellRef,
    closedTriggerSizeRef,
    paintOpenHeightPx,
    setPaintOpenHeightPx,
    captureClosedTriggerSize,
    getClosedTriggerSizePx,
    getOpenTriggerSizePx,
  };
}
