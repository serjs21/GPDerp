"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { useReducedMotion } from "motion/react";
import { BrushOption, type BrushOptionBrushPaths } from "./BrushOption";
import { BrushPaintLayer } from "./BrushPaintLayer";
import { BRUSH_OPTION_MIN_WIDTH_REM } from "./brushRevealPaths";
import {
  useBrushMenuDrawAnimation,
  type BrushMenuDrawPhase,
  type BrushRevealPathGroup,
  type BrushTriggerSizePx,
} from "./useBrushMenuDrawAnimation";
import styles from "./BrushMenu.module.css";

export type BrushMenuOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Show the row but do not select or close the menu. */
  displayOnly?: boolean;
  /** Override round-robin brush stroke asset. */
  iconSrc?: string;
  className?: string;
};

export type BrushMenuProps = {
  options: BrushMenuOption[];
  value?: string | null;
  onChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  /**
   * Paint brush + expanding label on the trigger itself (in-flow width).
   * Avatar/icon from `renderTrigger` stays mounted at the closed origin;
   * brush and expand label draw underneath / beside it.
   */
  triggerBrush?: boolean;
  /** Label shown beside the trigger when open (contributes real layout width). */
  expandLabel?: ReactNode;
  renderTrigger?: (ctx: { open: boolean; label: string }) => ReactNode;
};

function useOpenState(
  openProp: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return { open, setOpen };
}

function useDismissOnOutside({
  open,
  disabled,
  rootRef,
  requestClose,
}: {
  open: boolean;
  disabled: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  requestClose: () => void;
}) {
  useEffect(() => {
    if (!open || disabled) return;

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        requestClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [disabled, open, rootRef, requestClose]);
}

function BrushOptionList({
  listId,
  options,
  value,
  disabled,
  placeholder,
  brushPathsRef,
  labelElsRef,
  onSelect,
}: {
  listId: string;
  options: BrushMenuOption[];
  value: string | null;
  disabled: boolean;
  placeholder: string;
  brushPathsRef: RefObject<(BrushOptionBrushPaths | null)[]>;
  labelElsRef: RefObject<(HTMLSpanElement | null)[]>;
  onSelect: (nextValue: string) => void;
}) {
  return (
    <ul
      id={listId}
      className={styles.panel}
      role="listbox"
      aria-label={placeholder}
    >
      {options.map((option, index) => (
        <li key={option.value} className={styles.item} role="none">
          <BrushOption
            onBrushPaths={(paths) => {
              brushPathsRef.current[index] = paths;
            }}
            labelRef={(node) => {
              labelElsRef.current[index] = node;
            }}
            index={index}
            iconSrc={option.iconSrc}
            label={option.label}
            selected={option.value === value}
            disabled={option.disabled || disabled}
            displayOnly={option.displayOnly}
            className={option.className}
            role="option"
            aria-selected={option.value === value}
            data-brush-option=""
            onSelect={() => {
              if (option.displayOnly) return;
              onSelect(option.value);
            }}
          />
        </li>
      ))}
    </ul>
  );
}

function resolveTriggerLabel(
  options: BrushMenuOption[],
  value: string | null,
  placeholder: string,
) {
  const selected = options.find((option) => option.value === value);
  if (!selected) return placeholder;
  return typeof selected.label === "string" ? selected.label : placeholder;
}

function toPathGroups(
  entries: (BrushOptionBrushPaths | null)[],
): BrushRevealPathGroup[] {
  const groups: BrushRevealPathGroup[] = [];
  for (const paths of entries) {
    if (!paths || paths.length === 0) continue;
    groups.push(paths);
  }
  return groups;
}

export function BrushMenu({
  options,
  value = null,
  onChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Select",
  disabled = false,
  className,
  triggerClassName,
  triggerBrush = false,
  expandLabel,
  renderTrigger,
}: BrushMenuProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerBrushPathsRef = useRef<BrushOptionBrushPaths | null>(null);
  const triggerExpandLabelRef = useRef<HTMLSpanElement | null>(null);
  const closedTriggerSizeRef = useRef<BrushTriggerSizePx>({
    width: 36,
    height: 36,
  });
  const brushPathsRef = useRef<(BrushOptionBrushPaths | null)[]>([]);
  const labelElsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const { open, setOpen } = useOpenState(openProp, defaultOpen, onOpenChange);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const panelMounted = open || closing;
  const drawPhase: BrushMenuDrawPhase | null = closing
    ? "closing"
    : open
      ? "open"
      : null;

  const captureClosedTriggerSize = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const prevW = shell.style.width;
    const prevH = shell.style.height;
    shell.style.width = "";
    shell.style.height = "";
    closedTriggerSizeRef.current = {
      width: shell.offsetWidth || 36,
      height: shell.offsetHeight || 36,
    };
    shell.style.width = prevW;
    shell.style.height = prevH;
  }, []);

  useLayoutEffect(() => {
    if (panelMounted || !triggerBrush) return;
    captureClosedTriggerSize();
  }, [
    panelMounted,
    triggerBrush,
    expandLabel,
    renderTrigger,
    captureClosedTriggerSize,
  ]);

  useLayoutEffect(() => {
    if (!triggerBrush || !open || closing) return;
    const shell = shellRef.current;
    if (!shell || shell.style.width) return;
    const closed = closedTriggerSizeRef.current;
    shell.style.width = `${closed.width}px`;
    shell.style.height = `${closed.height}px`;
  }, [open, closing, triggerBrush]);

  const requestClose = useCallback(() => {
    if (disabled || closing || !open) return;
    if (reducedMotion) {
      setOpen(false);
      return;
    }
    setClosing(true);
    setOpen(false);
  }, [closing, disabled, open, reducedMotion, setOpen]);

  const handleCloseComplete = useCallback(() => {
    setClosing(false);
    triggerBrushPathsRef.current = null;
    brushPathsRef.current = [];
    labelElsRef.current = [];
    if (shellRef.current) {
      shellRef.current.style.width = "";
      shellRef.current.style.height = "";
    }
  }, []);

  useDismissOnOutside({
    open: panelMounted && !closing,
    disabled,
    rootRef,
    requestClose,
  });

  const getBrushPathGroups = useCallback(() => {
    const groups: BrushRevealPathGroup[] = [];
    if (triggerBrush && triggerBrushPathsRef.current) {
      groups.push(triggerBrushPathsRef.current);
    }
    groups.push(...toPathGroups(brushPathsRef.current));
    return groups;
  }, [triggerBrush]);

  const getLabelEls = useCallback(() => {
    const labels: HTMLSpanElement[] = [];
    if (triggerBrush && triggerExpandLabelRef.current) {
      labels.push(triggerExpandLabelRef.current);
    }
    for (const label of labelElsRef.current) {
      if (label) labels.push(label);
    }
    return labels;
  }, [triggerBrush]);

  const getSizeEl = useCallback(
    () => (triggerBrush ? shellRef.current : null),
    [triggerBrush],
  );

  const getClosedTriggerSizePx = useCallback(
    () => closedTriggerSizeRef.current,
    [],
  );

  const getOpenTriggerSizePx = useCallback((): BrushTriggerSizePx => {
    const root = rootRef.current;
    const option = root?.querySelector<HTMLElement>("[data-brush-option]");
    const panel = root?.querySelector<HTMLElement>(`.${styles.panel}`);
    // Prefer panel width so trigger matches the full menu label column.
    const width =
      panel?.offsetWidth ||
      option?.offsetWidth ||
      Math.max(
        closedTriggerSizeRef.current.width,
        BRUSH_OPTION_MIN_WIDTH_REM * 16,
      );
    const height =
      option?.offsetHeight || closedTriggerSizeRef.current.height;
    return { width, height };
  }, []);

  useBrushMenuDrawAnimation({
    phase: drawPhase,
    reducedMotion,
    getBrushPathGroups,
    getLabelEls,
    getSizeEl,
    getClosedTriggerSizePx,
    getOpenTriggerSizePx,
    onCloseComplete: handleCloseComplete,
  });

  const triggerLabel = resolveTriggerLabel(options, value, placeholder);

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

  const showTriggerBrush = triggerBrush && panelMounted;
  const showExpandLabel =
    triggerBrush && panelMounted && expandLabel != null;

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      className={`${styles.trigger}${
        triggerClassName ? ` ${triggerClassName}` : ""
      }${triggerBrush ? ` ${styles.triggerAnchored}` : ""}${
        showTriggerBrush ? ` ${styles.triggerBrushOpen}` : ""
      }`}
      data-brush-open={showTriggerBrush ? "true" : undefined}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={panelMounted}
      aria-controls={panelMounted ? listId : undefined}
      onClick={toggleOpen}
    >
      {showTriggerBrush ? (
        <BrushPaintLayer
          index={0}
          onBrushPaths={(paths) => {
            triggerBrushPathsRef.current = paths;
          }}
        />
      ) : null}
      <span className={styles.triggerFace}>
        {renderTrigger
          ? renderTrigger({ open: panelMounted, label: triggerLabel })
          : triggerLabel}
        {showExpandLabel ? (
          <span className={styles.expandSlot}>
            <span ref={triggerExpandLabelRef} className={styles.expandLabel}>
              {expandLabel}
            </span>
          </span>
        ) : null}
      </span>
    </button>
  );

  return (
    <div
      ref={rootRef}
      className={`${styles.wrap}${className ? ` ${className}` : ""}`}
      style={
        {
          ["--brush-option-min-width"]: `${BRUSH_OPTION_MIN_WIDTH_REM}rem`,
        } as CSSProperties
      }
    >
      {triggerBrush ? (
        <div ref={shellRef} className={styles.shell}>
          <div className={styles.avatarSlot} aria-hidden />
          {triggerButton}
        </div>
      ) : (
        triggerButton
      )}

      {panelMounted ? (
        <BrushOptionList
          listId={listId}
          options={options}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          brushPathsRef={brushPathsRef}
          labelElsRef={labelElsRef}
          onSelect={handleSelect}
        />
      ) : null}
    </div>
  );
}
