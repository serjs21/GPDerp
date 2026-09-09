"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
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

/**
 * Comic speech-bubble dropdown with scrollable options and a checkmarked selection.
 */
export function TextBubbleDropdown({
  options,
  value = null,
  onChange,
  placeholder = "Select option",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  disabled = false,
  tailDirection = "top-left",
  dropDirection = "down",
}: TextBubbleDropdownProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
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

  const selected = options.find((option) => option.value === value) ?? null;
  const triggerLabel = selected?.label ?? placeholder;

  const getTargets = useCallback(
    () => [
      {
        element: shellRef.current,
        style: "speech" as const,
        sourceDirection: tailDirection,
        // Must stay false: isQuestion strips tails in applySourceDirectionToSpec.
        isQuestion: false,
        backgroundColors: ["#f7f4ef"],
      },
    ],
    [tailDirection],
  );

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
  }, [disabled, open, setOpen]);

  const toggle = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const selectOption = (nextValue: string) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  const stagePaddingClass = stagePaddingClassForDirection(tailDirection, {
    stageTailBottom: styles.stageTailBottom,
    stageTailTop: styles.stageTailTop,
    stageTailLeft: styles.stageTailLeft,
    stageTailRight: styles.stageTailRight,
    stageCompact: styles.stageCompact,
  });

  const panelClass = [styles.panel, DROP_PANEL_CLASS[dropDirection]].filter(Boolean).join(" ");

  return (
    <div
      ref={rootRef}
      className={[styles.root, open ? styles.rootOpen : null, className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={toggle}
      >
        {triggerLabel}
      </button>

      {open ? (
        <div className={panelClass} data-state="open" data-drop={dropDirection}>
          <ComicBubbleStage
            active
            targetsKey={`text-bubble-dropdown:${tailDirection}:${dropDirection}:${options.length}:${value ?? ""}`}
            getTargets={getTargets}
            className={[stageStyles.stage, styles.stage, stagePaddingClass]
              .filter(Boolean)
              .join(" ")}
          >
            <div ref={shellRef} className={styles.shell} data-comic-role="dialog-content">
              <ul id={listId} role="listbox" className={styles.list} aria-label={placeholder}>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} className={styles.item}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={[
                          styles.option,
                          isSelected ? styles.optionSelected : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => selectOption(option.value)}
                      >
                        <span className={styles.optionLabel}>{option.label}</span>
                        {isSelected ? (
                          <span className={styles.check} aria-hidden>
                            ✓
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </ComicBubbleStage>
        </div>
      ) : null}
    </div>
  );
}
