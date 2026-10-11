import type { CSSProperties } from "react";
import type { BrushMenuOption } from "../BrushMenu.types";
import type { BrushOptionBrushPaths } from "../BrushPaintLayer";
import type { BrushMenuDrawPhase, BrushRevealPathGroup } from "../useBrushMenuDrawAnimation";

export function resolveTriggerLabel(options: BrushMenuOption[], value: string | null, placeholder: string) {
  const selected = options.find((option) => option.value === value);
  if (!selected) return placeholder;
  return typeof selected.label === "string" ? selected.label : placeholder;
}

export function toPathGroups(entries: (BrushOptionBrushPaths | null)[]): BrushRevealPathGroup[] {
  const groups: BrushRevealPathGroup[] = [];
  for (const paths of entries) {
    if (!paths || paths.length === 0) continue;
    groups.push(paths);
  }
  return groups;
}

/**
 * Panel stays mounted through the close animation, showing the options captured when closing started
 * (navigation must not swap rows mid-animation).
 */
export function brushMenuPhaseView(
  open: boolean,
  closing: boolean,
  closingOptions: BrushMenuOption[] | null,
  options: BrushMenuOption[],
  disabled: boolean,
) {
  const drawPhase: BrushMenuDrawPhase | null = closing ? "closing" : open ? "open" : null;
  const panelMounted = open || closing;
  return {
    panelMounted,
    /** Outside pointer / Escape closes only a fully open, enabled menu. */
    dismissible: panelMounted && !closing && !disabled,
    displayedOptions: closing && closingOptions ? closingOptions : options,
    drawPhase,
  };
}

export function brushMenuTriggerView(params: {
  styles: Record<string, string>;
  triggerClassName: string | undefined;
  triggerBrush: boolean;
  panelMounted: boolean;
  hasExpandLabel: boolean;
  listId: string;
}) {
  const { styles, triggerClassName, triggerBrush, panelMounted, hasExpandLabel, listId } = params;
  const showTriggerBrush = triggerBrush && panelMounted;
  return {
    showTriggerBrush,
    showExpandLabel: showTriggerBrush && hasExpandLabel,
    className: [
      styles.trigger,
      triggerClassName,
      triggerBrush ? styles.triggerAnchored : null,
      showTriggerBrush ? styles.triggerBrushOpen : null,
    ]
      .filter(Boolean)
      .join(" "),
    dataBrushOpen: showTriggerBrush ? "true" : undefined,
    ariaControls: panelMounted ? listId : undefined,
  };
}

/** Brush trigger: panel sits under the full paint height; plain trigger: directly below. */
export function brushPanelStyle(
  triggerBrush: boolean,
  paintOpenHeightPx: number | null,
  closedHeightPx: number,
): CSSProperties {
  if (!triggerBrush) return { top: "100%", marginTop: "var(--brush-stack-gap)" };
  return { top: `calc(${paintOpenHeightPx ?? closedHeightPx}px + var(--brush-stack-gap))` };
}
