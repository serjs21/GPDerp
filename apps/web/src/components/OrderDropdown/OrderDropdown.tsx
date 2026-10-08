"use client";

import { useTranslations } from "next-intl";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { LabelSort } from "@/components/LabelSort";
import { OrderDropdownCover } from "@/components/OrderDropdownCover";
import { useDismissOnOutside } from "@/hooks/useDismissOnOutside";
import { ORDER_SORT_CATEGORIES, ORDER_SORT_TITLE } from "./consts/orderDropdownConsts";
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
  "aria-label": ariaLabelProp,
}: OrderDropdownProps) {
  const t = useTranslations("OrderDropdown");
  const ariaLabel = ariaLabelProp ?? t("ariaLabel");
  const categories = useMemo(
    () =>
      ORDER_SORT_CATEGORIES.map((category) => ({
        ...category,
        title: t(category.title),
        ariaLabel: t(category.ariaLabel),
      })),
    [t],
  );
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
      {/* Stays mounted while closed so the coins keep their pose instead of replaying it on reopen. */}
      <div
        id={menuId}
        className={[styles.menu, open && !disabled ? "" : styles.menuClosed]
          .filter(Boolean)
          .join(" ")}
      >
        <LabelSort
          value={value}
          onChange={onChange}
          categories={categories}
          title={t(ORDER_SORT_TITLE)}
          clusterClassName={styles.cluster}
          rotated
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
