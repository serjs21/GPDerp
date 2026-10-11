"use client";

import { ComicPressButton } from "@/components/ComicPressButton";
import type { TextBubbleTriggerProps } from "./TextBubbleTrigger.types";
import styles from "./TextBubbleDropdown.module.css";

export function TextBubbleTrigger({
  open,
  label,
  value,
  renderTrigger,
  controlsId,
  disabled,
  onToggle,
}: TextBubbleTriggerProps) {
  return (
    <ComicPressButton
      className={styles.trigger}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={controlsId}
      disabled={disabled}
      onClick={onToggle}
    >
      {renderTrigger ? renderTrigger({ open, label, value }) : label}
    </ComicPressButton>
  );
}
