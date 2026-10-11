import type { CSSProperties, ReactNode, RefObject } from "react";
import type { BrushOptionBrushPaths } from "./BrushPaintLayer";

export type BrushMenuOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Show the row but do not select or close the menu. */
  displayOnly?: boolean;
  /** Override round-robin brush stroke asset. */
  iconSrc?: string;
  /** Label text color (defaults to cream). */
  color?: string;
  /** Comic-burst fill behind the option icon (`--brush-option-icon-fill`). */
  backgroundColor?: string;
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

export type BrushOptionListProps = {
  listId: string;
  options: BrushMenuOption[];
  value: string | null;
  disabled: boolean;
  placeholder: string;
  brushPathsRef: RefObject<(BrushOptionBrushPaths | null)[]>;
  labelElsRef: RefObject<(HTMLSpanElement | null)[]>;
  onSelect: (nextValue: string) => void;
  panelStyle?: CSSProperties;
};

export type BrushMenuTriggerShellProps = {
  triggerBrush: boolean;
  shellRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export type BrushMenuTriggerProps = Pick<BrushMenuProps, "triggerClassName" | "expandLabel" | "renderTrigger"> & {
  buttonRef: RefObject<HTMLButtonElement | null>;
  brushPathsRef: RefObject<BrushOptionBrushPaths | null>;
  expandLabelRef: RefObject<HTMLSpanElement | null>;
  triggerBrush: boolean;
  panelMounted: boolean;
  listId: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
};
