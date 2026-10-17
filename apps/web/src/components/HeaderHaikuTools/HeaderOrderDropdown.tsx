"use client";

import { usePathname } from "next/navigation";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { OrderDropdown } from "@/components/OrderDropdown";
import { coverWidthRemForLabelWidth } from "@/components/OrderDropdownCover";
import { HEADER_TOOL_WIDTH_REM } from "./consts/headerToolConsts";
import type { HeaderOrderDropdownProps } from "./HeaderOrderDropdown.types";
import toolStyles from "./HeaderHaikuTools.module.css";
import styles from "./HeaderToolButton.module.css";

/** Gavel label as wide as the other header tools. */
const HEADER_ORDER_COVER_WIDTH_REM = coverWidthRemForLabelWidth(HEADER_TOOL_WIDTH_REM);

/** Header gavel that opens the haiku sort column; drives the lantern path order. */
export function HeaderOrderDropdown({ className }: HeaderOrderDropdownProps) {
  const pathname = usePathname();
  const { orderSort, setOrderSort } = useHaikuFilters();

  if (pathname !== "/") return null;

  return (
    <div className={[styles.anchor, toolStyles.shrinkTool, className].filter(Boolean).join(" ")}>
      <OrderDropdown
        value={orderSort}
        onChange={setOrderSort}
        widthRem={HEADER_ORDER_COVER_WIDTH_REM}
      />
    </div>
  );
}
