"use client";

import { BrushOption } from "./BrushOption";
import type { BrushOptionListProps } from "./BrushMenu.types";
import styles from "./BrushMenu.module.css";

export function BrushOptionList({
  listId,
  options,
  value,
  disabled,
  placeholder,
  brushPathsRef,
  labelElsRef,
  onSelect,
  panelStyle,
}: BrushOptionListProps) {
  return (
    <ul id={listId} className={styles.panel} role="listbox" aria-label={placeholder} style={panelStyle}>
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
            color={option.color}
            backgroundColor={option.backgroundColor}
            selected={option.value === value}
            disabled={option.disabled || disabled}
            displayOnly={option.displayOnly}
            className={option.className}
            role="option"
            aria-selected={option.value === value}
            data-brush-option=""
            onSelect={() => {
              if (option.displayOnly) return;
              onSelect(option.value);
            }}
          />
        </li>
      ))}
    </ul>
  );
}
