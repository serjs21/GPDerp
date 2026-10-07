"use client";

import { useCallback, useId, useRef, useState } from "react";
import { LabelSort } from "@/components/LabelSort";
import { OrderDropdownCover } from "@/components/OrderDropdownCover";
import { useDismissOnOutside } from "@/hooks/useDismissOnOutside";
import { ORDER_SORT_CATEGORIES } from "./consts/orderDropdownConsts";
import type { OrderDropdownProps } from "./OrderDropdown.types";
import styles from "./OrderDropdown.module.css";

/**
 * Gavel cover that toggles a vertical sort column (creation date / alpacabet)
 * below it. Picking a coin keeps the menu open so the direction can be flipped.
 */
export function OrderDropdown({
  value,
  onChange,
  widthRem,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Sort haikus",
}: OrderDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useDismissOnOutside(open && !disabled, rootRef, close);

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <OrderDropdownCover
        widthRem={widthRem}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      />
      {open && !disabled ? (
        <div id={menuId} className={styles.menu}>
          <LabelSort
            value={value}
            onChange={onChange}
            categories={ORDER_SORT_CATEGORIES}
            rotated
            aria-label={ariaLabel}
          />
        </div>
      ) : null}
    </div>
  );
}
