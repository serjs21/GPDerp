import type { ReactNode } from "react";
import type { TextBubbleDropdownProps, TextBubbleOption } from "./TextBubbleDropdown.types";

export type TextBubbleOptionListProps = {
  listId: string;
  options: TextBubbleOption[];
  value: string | null;
  placeholder: string;
  emptyMessage?: ReactNode;
  renderOption?: TextBubbleDropdownProps["renderOption"];
  onSelect: (value: string) => void;
};
