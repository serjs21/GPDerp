import type { TextBubbleDropdownProps } from "./TextBubbleDropdown.types";

export type TextBubbleTriggerProps = {
  open: boolean;
  label: string;
  value: string | null;
  renderTrigger?: TextBubbleDropdownProps["renderTrigger"];
  /** Listbox id while the panel is present. */
  controlsId?: string;
  disabled: boolean;
  onToggle: () => void;
};
