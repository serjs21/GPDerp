"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  OrderDropdown,
  ORDER_SORT_DEFAULT_VALUE,
  type OrderSortValue,
} from "@/components/OrderDropdown";
import { coverWidthRemForLabelSize } from "@/components/OrderDropdownCover";
import { HEADER_NAV_ICON_SIZE_PX } from "@/consts/header/siteHeaderConsts";
import type { HeaderOrderDropdownProps } from "./HeaderOrderDropdown.types";
import styles from "./HeaderToolButton.module.css";

/** Square gavel label sized to the other header tools. */
const HEADER_ORDER_COVER_WIDTH_REM = coverWidthRemForLabelSize(HEADER_NAV_ICON_SIZE_PX / 16);

/** Header gavel that opens the haiku sort column (UI only — not wired to the feed yet). */
export function HeaderOrderDropdown({ className }: HeaderOrderDropdownProps) {
  const pathname = usePathname();
  const [value, setValue] = useState<OrderSortValue>(ORDER_SORT_DEFAULT_VALUE);

  if (pathname !== "/") return null;

  return (
    <div className={[styles.anchor, className].filter(Boolean).join(" ")}>
      <OrderDropdown value={value} onChange={setValue} widthRem={HEADER_ORDER_COVER_WIDTH_REM} />
    </div>
  );
}
