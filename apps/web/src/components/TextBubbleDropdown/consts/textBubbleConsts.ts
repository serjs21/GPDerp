import styles from "../TextBubbleDropdown.module.css";
import type { TextBubbleDropDirection } from "../TextBubbleDropdown.types";

export const TEXT_BUBBLE_DROPDOWN_DEFAULTS = {
  value: null,
  defaultOpen: false,
  disabled: false,
  tailDirection: "top-left",
  dropDirection: "down",
} as const;

export const DROP_PANEL_CLASS: Record<TextBubbleDropDirection, string> = {
  down: styles.panelDropDown,
  up: styles.panelDropUp,
  left: styles.panelDropLeft,
  right: styles.panelDropRight,
  "down-left": styles.panelDropDownLeft,
  "down-right": styles.panelDropDownRight,
  "up-left": styles.panelDropUpLeft,
  "up-right": styles.panelDropUpRight,
};

export const BUBBLE_FILL = ["#f7f4ef"] as const;
