"use client";

import { memo } from "react";
import type { TextBubbleOptionListProps } from "./TextBubbleOptionList.types";
import styles from "./TextBubbleDropdown.module.css";

export const TextBubbleOptionList = memo(function TextBubbleOptionList({
  listId,
  options,
  value,
  placeholder,
  emptyMessage,
  renderOption,
  onSelect,
}: TextBubbleOptionListProps) {
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
