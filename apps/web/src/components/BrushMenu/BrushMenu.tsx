"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useDismissOnOutside } from "@/hooks/useDismissOnOutside";
import { withDefaults } from "@/utils/props/withDefaults";
import type { BrushMenuOption, BrushMenuProps } from "./BrushMenu.types";
import { BrushMenuTrigger } from "./BrushMenuTrigger";
import { BrushMenuTriggerShell } from "./BrushMenuTriggerShell";
import { BrushOptionList } from "./BrushOptionList";
import { BRUSH_MENU_ROOT_STYLE } from "./consts/brushMenuConsts";
import { useBrushMenuDrawAnimation, type BrushTriggerSizePx } from "./useBrushMenuDrawAnimation";
import { useBrushMenuDrawRegistry } from "./useBrushMenuDrawRegistry";
import { useBrushMenuOpenState } from "./useBrushMenuOpenState";
import { useBrushTriggerSize } from "./useBrushTriggerSize";
import { brushMenuPhaseView, brushPanelStyle, resolveTriggerLabel } from "./utils/brushMenuUtils";
import styles from "./BrushMenu.module.css";

export type { BrushMenuOption, BrushMenuProps } from "./BrushMenu.types";

const BRUSH_MENU_DEFAULTS = {
  value: null,
  defaultOpen: false,
  disabled: false,
  triggerBrush: false,
};

export function BrushMenu(props: BrushMenuProps) {
  const { value, defaultOpen, disabled, triggerBrush, className, triggerClassName } = withDefaults(
    props,
    BRUSH_MENU_DEFAULTS,
  );
  const { options, onChange, expandLabel, renderTrigger } = props;
  const t = useTranslations("BrushMenu");
  const placeholder = props.placeholder ?? t("placeholder");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { open, setOpen } = useBrushMenuOpenState(props.open, defaultOpen, props.onOpenChange);
  const [closing, setClosing] = useState(false);
  const [closingOptions, setClosingOptions] = useState<BrushMenuOption[] | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { panelMounted, dismissible, displayedOptions, drawPhase } = brushMenuPhaseView(
    open,
    closing,
    closingOptions,
    options,
    disabled,
  );

  const {
    shellRef,
    closedTriggerSizeRef,
    paintOpenHeightPx,
    setPaintOpenHeightPx,
    captureClosedTriggerSize,
    getClosedTriggerSizePx,
    getOpenTriggerSizePx,
  } = useBrushTriggerSize({
    rootRef,
    triggerBrush,
    open,
    closing,
    panelMounted,
    expandLabel,
    renderTrigger,
    displayedOptions,
  });
  const {
    triggerBrushPathsRef,
    triggerExpandLabelRef,
    brushPathsRef,
    labelElsRef,
    getBrushPathGroups,
    getLabelEls,
    resetDrawRegistry,
  } = useBrushMenuDrawRegistry(triggerBrush);

  const requestClose = useCallback(() => {
    if (disabled || closing || !open) return;
    if (reducedMotion) {
      setOpen(false);
      setPaintOpenHeightPx(null);
      return;
    }
    setClosingOptions(options);
    setClosing(true);
    setOpen(false);
  }, [closing, disabled, open, options, reducedMotion, setOpen, setPaintOpenHeightPx]);

  const handleCloseComplete = useCallback(() => {
    setClosing(false);
    setClosingOptions(null);
    setPaintOpenHeightPx(null);
    resetDrawRegistry();
    if (shellRef.current) {
      shellRef.current.style.width = "";
      shellRef.current.style.height = "";
    }
    if (triggerRef.current) {
      triggerRef.current.style.height = "";
    }
  }, [resetDrawRegistry, setPaintOpenHeightPx, shellRef]);

  useDismissOnOutside(dismissible, rootRef, requestClose);

  const getSizeEl = useCallback(() => (triggerBrush ? shellRef.current : null), [shellRef, triggerBrush]);
  const getPaintEl = useCallback(() => (triggerBrush ? triggerRef.current : null), [triggerBrush]);
  const handleOpenSize = useCallback(
    (size: BrushTriggerSizePx) => {
      setPaintOpenHeightPx(size.height);
    },
    [setPaintOpenHeightPx],
  );

  useBrushMenuDrawAnimation({
    phase: drawPhase,
    reducedMotion,
    getBrushPathGroups,
    getLabelEls,
    getSizeEl,
    getPaintEl,
    getClosedTriggerSizePx,
    getOpenTriggerSizePx,
    onOpenSize: handleOpenSize,
    onCloseComplete: handleCloseComplete,
  });

  const triggerLabel = resolveTriggerLabel(displayedOptions, value, placeholder);

  const handleSelect = (nextValue: string) => {
    onChange?.(nextValue);
    requestClose();
  };

  const toggleOpen = () => {
    if (disabled || closing) return;
    if (open) {
      requestClose();
      return;
    }
    if (triggerBrush) captureClosedTriggerSize();
    setOpen(true);
  };

  return (
    <div ref={rootRef} className={[styles.wrap, className].filter(Boolean).join(" ")} style={BRUSH_MENU_ROOT_STYLE}>
      <BrushMenuTriggerShell triggerBrush={triggerBrush} shellRef={shellRef}>
        <BrushMenuTrigger
          buttonRef={triggerRef}
          brushPathsRef={triggerBrushPathsRef}
          expandLabelRef={triggerExpandLabelRef}
          triggerClassName={triggerClassName}
          triggerBrush={triggerBrush}
          panelMounted={panelMounted}
          listId={listId}
          label={triggerLabel}
          disabled={disabled}
          expandLabel={expandLabel}
          renderTrigger={renderTrigger}
          onClick={toggleOpen}
        />
      </BrushMenuTriggerShell>

      {panelMounted ? (
        <BrushOptionList
          listId={listId}
          options={displayedOptions}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          brushPathsRef={brushPathsRef}
          labelElsRef={labelElsRef}
          onSelect={handleSelect}
          panelStyle={brushPanelStyle(triggerBrush, paintOpenHeightPx, closedTriggerSizeRef.current.height)}
        />
      ) : null}
    </div>
  );
}
