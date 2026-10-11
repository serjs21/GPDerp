"use client";

import { BrushPaintLayer } from "./BrushPaintLayer";
import type { BrushMenuTriggerProps } from "./BrushMenu.types";
import { brushMenuTriggerView } from "./utils/brushMenuUtils";
import styles from "./BrushMenu.module.css";

/** Trigger button; with `triggerBrush` it paints a brush underneath and expands a label while open. */
export function BrushMenuTrigger({
  buttonRef,
  brushPathsRef,
  expandLabelRef,
  triggerClassName,
  triggerBrush,
  panelMounted,
  listId,
  label,
  disabled,
  expandLabel,
  renderTrigger,
  onClick,
}: BrushMenuTriggerProps) {
  const view = brushMenuTriggerView({
    styles,
    triggerClassName,
    triggerBrush,
    panelMounted,
    hasExpandLabel: expandLabel != null,
    listId,
  });

  return (
    <button
      ref={buttonRef}
      type="button"
      className={view.className}
      data-brush-open={view.dataBrushOpen}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={panelMounted}
      aria-controls={view.ariaControls}
      onClick={onClick}
    >
      {view.showTriggerBrush ? (
        <BrushPaintLayer
          index={0}
          onBrushPaths={(paths) => {
            brushPathsRef.current = paths;
          }}
        />
      ) : null}
      <span className={styles.triggerFace}>
        {renderTrigger ? renderTrigger({ open: panelMounted, label }) : label}
        {view.showExpandLabel ? (
          <span className={styles.expandSlot}>
            <span ref={expandLabelRef} className={styles.expandLabel}>
              {expandLabel}
            </span>
          </span>
        ) : null}
      </span>
    </button>
  );
}
