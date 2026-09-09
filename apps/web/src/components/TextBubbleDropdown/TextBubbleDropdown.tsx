"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import stageStyles from "@/components/ComicConfirmModal/comicBubbleStage.module.css";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "@/components/ComicConfirmModal/comicSourceDirection";
import styles from "./TextBubbleDropdown.module.css";

export type TextBubbleOption = {
  value: string;
  label: string;
};

/** Where the speech tail points (comical source direction). */
export type TextBubbleTailDirection = ComicSourceDirection;

/** Which side of the trigger the panel opens toward. */
export type TextBubbleDropDirection =
  | "down"
  | "up"
  | "left"
  | "right"
  | "down-left"
  | "down-right"
  | "up-left"
  | "up-right";

export type TextBubbleDropdownProps = {
  options: TextBubbleOption[];
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  disabled?: boolean;
  /**
   * Speech-tail orientation.
   * Default `top-left` so a downward dropdown points at the trigger.
   */
  tailDirection?: TextBubbleTailDirection;
  /** Panel placement relative to the trigger. Default `down`. */
  dropDirection?: TextBubbleDropDirection;
  /** Override the default text trigger button contents. */
  renderTrigger?: (ctx: {
    open: boolean;
    label: string;
    value: string | null;
  }) => ReactNode;
  /** Override default option row contents. */
  renderOption?: (ctx: {
    option: TextBubbleOption;
    selected: boolean;
  }) => ReactNode;
  /** Optional content above the option list (e.g. search field). */
  panelHeader?: ReactNode;
  /** Shown when `options` is empty (e.g. no search matches). */
  emptyMessage?: ReactNode;
};

type BubbleTarget = {
  element: HTMLDivElement | null;
  style: "speech";
  sourceDirection: TextBubbleTailDirection;
  isQuestion: boolean;
  backgroundColors: string[];
};

const DROP_PANEL_CLASS: Record<TextBubbleDropDirection, string> = {
  down: styles.panelDropDown,
  up: styles.panelDropUp,
  left: styles.panelDropLeft,
  right: styles.panelDropRight,
  "down-left": styles.panelDropDownLeft,
  "down-right": styles.panelDropDownRight,
  "up-left": styles.panelDropUpLeft,
  "up-right": styles.panelDropUpRight,
};

const BUBBLE_FILL = ["#f7f4ef"] as const;

function useDismissOnOutside({
  open,
  disabled,
  rootRef,
  setOpen,
}: {
  open: boolean;
  disabled: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  setOpen: (next: boolean) => void;
}) {
  useEffect(() => {
    if (!open || disabled) return;

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [disabled, open, rootRef, setOpen]);
}

const TextBubbleOptionList = memo(function TextBubbleOptionList({
  listId,
  options,
  value,
  placeholder,
  emptyMessage,
  renderOption,
  onSelect,
}: {
  listId: string;
  options: TextBubbleOption[];
  value: string | null;
  placeholder: string;
  emptyMessage?: ReactNode;
  renderOption?: TextBubbleDropdownProps["renderOption"];
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) {
    return emptyMessage ? <p className={styles.empty}>{emptyMessage}</p> : null;
  }

  return (
    <ul id={listId} role="listbox" className={styles.list} aria-label={placeholder}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <li key={option.value} className={styles.item}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              className={[styles.option, isSelected ? styles.optionSelected : null]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(option.value)}
            >
              {renderOption ? (
                renderOption({ option, selected: isSelected })
              ) : (
                <>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected ? (
                    <span className={styles.check} aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
});

/**
 * Bubble stage stays mounted with a stable targetsKey so comical only
 * (re)calculates when direction config changes — not on search/value churn.
 */
const TextBubbleStage = memo(function TextBubbleStage({
  dropDirection,
  tailDirection,
  targetsKey,
  getTargets,
  shellRef,
  open,
  bubbleReady,
  onBubblesReady,
  children,
}: {
  dropDirection: TextBubbleDropDirection;
  tailDirection: TextBubbleTailDirection;
  targetsKey: string;
  getTargets: () => BubbleTarget[];
  shellRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  bubbleReady: boolean;
  onBubblesReady: () => void;
  children: ReactNode;
}) {
  const panelClass = useMemo(
    () => [styles.panel, DROP_PANEL_CLASS[dropDirection]].filter(Boolean).join(" "),
    [dropDirection],
  );
  const stagePaddingClass = useMemo(
    () =>
      stagePaddingClassForDirection(tailDirection, {
        stageTailBottom: styles.stageTailBottom,
        stageTailTop: styles.stageTailTop,
        stageTailLeft: styles.stageTailLeft,
        stageTailRight: styles.stageTailRight,
        stageCompact: styles.stageCompact,
      }),
    [tailDirection],
  );
  const stageClassName = useMemo(
    () => [stageStyles.stage, styles.stage, stagePaddingClass].filter(Boolean).join(" "),
    [stagePaddingClass],
  );

  const revealOpen = open && bubbleReady;

  return (
    <div
      className={[
        panelClass,
        open ? null : styles.panelClosed,
        open && !bubbleReady ? styles.panelAwaitingBubble : null,
      ]
        .filter(Boolean)
        .join(" ")}
      data-state={revealOpen ? "open" : "closed"}
      data-drop={dropDirection}
      data-bubble-ready={bubbleReady ? "true" : "false"}
      aria-hidden={!open}
    >
      <ComicBubbleStage
        active={true}
        targetsKey={targetsKey}
        getTargets={getTargets}
        className={stageClassName}
        onBubblesReady={onBubblesReady}
      >
        <div ref={shellRef} className={styles.shell} data-comic-role="dialog-content">
          {children}
        </div>
      </ComicBubbleStage>
    </div>
  );
});

function useOpenState({
  openProp,
  defaultOpen,
  onOpenChange,
}: {
  openProp: boolean | undefined;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return { open, setOpen };
}

/**
 * Comic speech-bubble dropdown with scrollable options and a checkmarked selection.
 */
export function TextBubbleDropdown(props: TextBubbleDropdownProps) {
  return (
    <TextBubbleDropdownInner
      options={props.options}
      value={props.value ?? null}
      onChange={props.onChange}
      placeholder={props.placeholder ?? "Select option"}
      openProp={props.open}
      defaultOpen={props.defaultOpen ?? false}
      onOpenChange={props.onOpenChange}
      className={props.className}
      disabled={props.disabled ?? false}
      tailDirection={props.tailDirection ?? "top-left"}
      dropDirection={props.dropDirection ?? "down"}
      renderTrigger={props.renderTrigger}
      renderOption={props.renderOption}
      panelHeader={props.panelHeader}
      emptyMessage={props.emptyMessage}
    />
  );
}

type InnerProps = {
  options: TextBubbleOption[];
  value: string | null;
  onChange?: (value: string) => void;
  placeholder: string;
  openProp?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  disabled: boolean;
  tailDirection: TextBubbleTailDirection;
  dropDirection: TextBubbleDropDirection;
  renderTrigger?: TextBubbleDropdownProps["renderTrigger"];
  renderOption?: TextBubbleDropdownProps["renderOption"];
  panelHeader?: ReactNode;
  emptyMessage?: ReactNode;
};

function TextBubbleDropdownInner({
  options,
  value,
  onChange,
  placeholder,
  openProp,
  defaultOpen,
  onOpenChange,
  className,
  disabled,
  tailDirection,
  dropDirection,
  renderTrigger,
  renderOption,
  panelHeader,
  emptyMessage,
}: InnerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const frozenShellSizeRef = useRef<{ width: number; height: number } | null>(null);
  const { open, setOpen } = useOpenState({ openProp, defaultOpen, onOpenChange });
  const [stageMounted, setStageMounted] = useState(open || defaultOpen);
  const [bubbleReady, setBubbleReady] = useState(false);

  useDismissOnOutside({ open, disabled, rootRef, setOpen });

  useEffect(() => {
    if (open) setStageMounted(true);
  }, [open]);

  useEffect(() => {
    if (!stageMounted) setBubbleReady(false);
  }, [stageMounted]);

  const handleBubblesReady = useCallback(() => {
    setBubbleReady(true);
  }, []);

  // Lock shell box after first open layout so search/filter can't reshape the bubble.
  useEffect(() => {
    if (!open) return;
    const shell = shellRef.current;
    if (!shell) return;

    const lockSize = () => {
      if (frozenShellSizeRef.current) {
        shell.style.minWidth = `${frozenShellSizeRef.current.width}px`;
        shell.style.minHeight = `${frozenShellSizeRef.current.height}px`;
        return;
      }
      const width = shell.offsetWidth;
      const height = shell.offsetHeight;
      if (width < 1 || height < 1) return;
      frozenShellSizeRef.current = { width, height };
      shell.style.minWidth = `${width}px`;
      shell.style.minHeight = `${height}px`;
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(lockSize);
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const selected = options.find((option) => option.value === value) ?? null;
  const triggerLabel = selected?.label ?? placeholder;

  const targetsKey = useMemo(
    () => `text-bubble-dropdown:${tailDirection}:${dropDirection}`,
    [tailDirection, dropDirection],
  );

  const getTargets = useCallback(
    (): BubbleTarget[] => [
      {
        element: shellRef.current,
        style: "speech",
        sourceDirection: tailDirection,
        // Must stay false: isQuestion strips tails in applySourceDirectionToSpec.
        isQuestion: false,
        backgroundColors: [...BUBBLE_FILL],
      },
    ],
    [tailDirection],
  );

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen(!open);
  }, [disabled, open, setOpen]);

  const selectOption = useCallback(
    (nextValue: string) => {
      onChange?.(nextValue);
      setOpen(false);
    },
    [onChange, setOpen],
  );

  const rootClass = useMemo(
    () => [styles.root, open ? styles.rootOpen : null, className].filter(Boolean).join(" "),
    [className, open],
  );

  const triggerContent = renderTrigger
    ? renderTrigger({ open, label: triggerLabel, value })
    : triggerLabel;

  return (
    <div ref={rootRef} className={rootClass}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open || stageMounted ? listId : undefined}
        disabled={disabled}
        onClick={toggle}
      >
        {triggerContent}
      </button>

      {stageMounted ? (
        <TextBubbleStage
          dropDirection={dropDirection}
          tailDirection={tailDirection}
          targetsKey={targetsKey}
          getTargets={getTargets}
          shellRef={shellRef}
          open={open}
          bubbleReady={bubbleReady}
          onBubblesReady={handleBubblesReady}
        >
          {panelHeader ? <div className={styles.panelHeader}>{panelHeader}</div> : null}
          <TextBubbleOptionList
            listId={listId}
            options={options}
            value={value}
            placeholder={placeholder}
            emptyMessage={emptyMessage}
            renderOption={renderOption}
            onSelect={selectOption}
          />
        </TextBubbleStage>
      ) : null}
    </div>
  );
}
