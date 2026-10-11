import type { ReactNode } from "react";
import type { ComicSourceDirection } from "@/components/ComicConfirmModal/comicSourceDirection";

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

export type TextBubbleTriggerContext = {
  open: boolean;
  label: string;
  value: string | null;
};

export type TextBubbleOptionContext = {
  option: TextBubbleOption;
  selected: boolean;
};

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
  renderTrigger?: (ctx: TextBubbleTriggerContext) => ReactNode;
  /** Override default option row contents. */
  renderOption?: (ctx: TextBubbleOptionContext) => ReactNode;
  /** Optional content above the option list (e.g. search field). */
  panelHeader?: ReactNode;
  /** Shown when `options` is empty (e.g. no search matches). */
  emptyMessage?: ReactNode;
};

export type TextBubbleTarget = {
  element: HTMLDivElement | null;
  style: "speech";
  sourceDirection: TextBubbleTailDirection;
  isQuestion: boolean;
  backgroundColors: string[];
};
