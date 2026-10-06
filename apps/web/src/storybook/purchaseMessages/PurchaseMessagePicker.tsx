"use client";

import type { PurchaseMessagePickerProps } from "./PurchaseMessagePicker.types";
import styles from "./PurchaseMessagePicker.module.css";

/** Storybook-only grid of API messages; picking one opens the modal under preview. */
export function PurchaseMessagePicker({ title, items, error, onPick }: PurchaseMessagePickerProps) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      {error ? <p className={styles.error}>{error}</p> : null}
      {items ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.label}>
              <button type="button" className={styles.item} onClick={() => onPick(item)}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.preview}>{item.message}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
