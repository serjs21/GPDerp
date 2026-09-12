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
import { useReducedMotion } from "motion/react";
import { BrushOption, type BrushOptionBrushPaths } from "./BrushOption";
import {
  useBrushMenuDrawAnimation,
  type BrushRevealPathGroup,
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
            onSelect={
              option.displayOnly ? undefined : () => onSelect(option.value)
            }
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
  triples: (BrushOptionBrushPaths | null)[],
): BrushRevealPathGroup[] {
  const groups: BrushRevealPathGroup[] = [];
  for (const triple of triples) {
    if (!triple) continue;
    const [main, upper, lower] = triple;
    if (main && upper && lower) {
      groups.push({ main, upper, lower });
    }
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
  renderTrigger,
}: BrushMenuProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const brushPathsRef = useRef<(BrushOptionBrushPaths | null)[]>([]);
  const labelElsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const { open, setOpen } = useOpenState(openProp, defaultOpen, onOpenChange);
  const reducedMotion = useReducedMotion() ?? false;

  useDismissOnOutside({ open, disabled, rootRef, setOpen });

  const getBrushPathGroups = useCallback(
    () => toPathGroups(brushPathsRef.current),
    [],
  );

  const getLabelEls = useCallback(
    () =>
      labelElsRef.current.filter(
        (label): label is HTMLSpanElement => label != null,
      ),
    [],
  );

  useBrushMenuDrawAnimation({
    open,
    reducedMotion,
    getBrushPathGroups,
    getLabelEls,
  });

  const triggerLabel = resolveTriggerLabel(options, value, placeholder);

  const handleSelect = (nextValue: string) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return;
    setOpen(!open);
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.wrap}${className ? ` ${className}` : ""}`}
    >
      <button
        type="button"
        className={`${styles.trigger}${
          triggerClassName ? ` ${triggerClassName}` : ""
        }`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={toggleOpen}
      >
        {renderTrigger
          ? renderTrigger({ open, label: triggerLabel })
          : triggerLabel}
      </button>

      {open ? (
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
