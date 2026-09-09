"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import stageStyles from "@/components/ComicConfirmModal/comicBubbleStage.module.css";
import type { ComicSourceDirection } from "@/components/ComicConfirmModal/comicSourceDirection";
import styles from "./TextBubbleDropdown.module.css";

export type TextBubbleOption = {
  value: string;
  label: string;
};

/** Where the CSS speech pointer aims (toward the trigger). */
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
   * CSS pointer orientation.
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

const CSS_TAIL_CLASS: Partial<Record<TextBubbleTailDirection, string>> = {
  top: styles.shellTailTop,
  "top-left": styles.shellTailTopLeft,
  "top-right": styles.shellTailTopRight,
  bottom: styles.shellTailBottom,
  "bottom-left": styles.shellTailBottomLeft,
  "bottom-right": styles.shellTailBottomRight,
  left: styles.shellTailLeft,
  right: styles.shellTailRight,
};

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

function TextBubbleOptionList({
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
}

function TextBubblePanel({
  dropDirection,
  options,
  value,
  listId,
  placeholder,
  emptyMessage,
  panelHeader,
  renderOption,
  tailDirection,
  shellRef,
  getTargets,
  onSelect,
}: {
  dropDirection: TextBubbleDropDirection;
  options: TextBubbleOption[];
  value: string | null;
  listId: string;
  placeholder: string;
  emptyMessage?: ReactNode;
  panelHeader?: ReactNode;
  renderOption?: TextBubbleDropdownProps["renderOption"];
  tailDirection: TextBubbleTailDirection;
  shellRef: RefObject<HTMLDivElement | null>;
  getTargets: () => Array<{
    element: HTMLDivElement | null;
    style: "rectangle";
    sourceDirection: "none";
    isQuestion: boolean;
    backgroundColors: string[];
  }>;
  onSelect: (value: string) => void;
}) {
  const cssTailClass = CSS_TAIL_CLASS[tailDirection] ?? null;
  const panelClass = [styles.panel, DROP_PANEL_CLASS[dropDirection]].filter(Boolean).join(" ");

  return (
    <div className={panelClass} data-state="open" data-drop={dropDirection}>
      <ComicBubbleStage
        active
        targetsKey={`text-bubble-dropdown:none:${dropDirection}:${options.length}:${value ?? ""}`}
        getTargets={getTargets}
        className={[stageStyles.stage, styles.stage, styles.stageCompact]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          ref={shellRef}
          className={[styles.shell, cssTailClass].filter(Boolean).join(" ")}
          data-comic-role="dialog-content"
          data-css-tail={tailDirection}
        >
          {panelHeader ? <div className={styles.panelHeader}>{panelHeader}</div> : null}
          <TextBubbleOptionList
            listId={listId}
            options={options}
            value={value}
            placeholder={placeholder}
            emptyMessage={emptyMessage}
            renderOption={renderOption}
            onSelect={onSelect}
          />
        </div>
      </ComicBubbleStage>
    </div>
  );
}

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
 * Comical draws a tailless bubble; the pointer is a CSS ::before/::after on the shell.
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
  const { open, setOpen } = useOpenState({ openProp, defaultOpen, onOpenChange });

  useDismissOnOutside({ open, disabled, rootRef, setOpen });

  const selected = options.find((option) => option.value === value) ?? null;
  const triggerLabel = selected?.label ?? placeholder;

  const getTargets = useCallback(
    () => [
      {
        element: shellRef.current,
        // Tight box so the CSS ::after pointer sits on the edge (speech outlines overshoot tall lists).
        style: "rectangle" as const,
        sourceDirection: "none" as const,
        isQuestion: false,
        backgroundColors: ["#f7f4ef"],
      },
    ],
    [],
  );

  const toggle = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const selectOption = (nextValue: string) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  const rootClass = [styles.root, open ? styles.rootOpen : null, className]
    .filter(Boolean)
    .join(" ");

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
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={toggle}
      >
        {triggerContent}
      </button>

      {open ? (
        <TextBubblePanel
          dropDirection={dropDirection}
          options={options}
          value={value}
          listId={listId}
          placeholder={placeholder}
          emptyMessage={emptyMessage}
          panelHeader={panelHeader}
          renderOption={renderOption}
          tailDirection={tailDirection}
          shellRef={shellRef}
          getTargets={getTargets}
          onSelect={selectOption}
        />
      ) : null}
    </div>
  );
}
