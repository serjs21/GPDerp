"use client";

import type { ReactNode } from "react";
import {
  ComicPagePanel,
  ComicPageRow,
  type ComicPagePanelProps,
} from "@/components/ComicPageLayout";

/** Panel chrome for a tab; omits selection wiring owned by ComicPanelTabs. */
export type ComicPagePanelOptions = Omit<
  ComicPagePanelProps,
  "children" | "selectable" | "selected" | "onSelect"
>;

export type ComicPanelTabConfig<T extends string = string> = {
  id: T;
  content: ReactNode;
  panel?: ComicPagePanelOptions;
};

export type ComicPanelTabsProps<T extends string = string> = {
  tabs: ComicPanelTabConfig<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  /** Applied to every panel (merged with per-tab `panel.className`). */
  panelClassName?: string;
  selectedFlexWeight?: number;
  unselectedFlexWeight?: number;
  "aria-label"?: string;
};

const DEFAULT_SELECTED_FLEX_WEIGHT = 1.15;
const DEFAULT_UNSELECTED_FLEX_WEIGHT = 0.95;

export function ComicPanelTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  panelClassName,
  selectedFlexWeight = DEFAULT_SELECTED_FLEX_WEIGHT,
  unselectedFlexWeight = DEFAULT_UNSELECTED_FLEX_WEIGHT,
  "aria-label": ariaLabel,
}: ComicPanelTabsProps<T>) {
  const row = (
    <ComicPageRow className={className}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        const {
          className: tabPanelClassName,
          flexWeight: tabFlexWeight,
          overflowVisible = false,
          isMotionBackground = false,
          ...panelRest
        } = tab.panel ?? {};

        return (
          <ComicPagePanel
            key={tab.id}
            {...panelRest}
            selectable
            selected={selected}
            onSelect={() => onChange(tab.id)}
            overflowVisible={overflowVisible}
            isMotionBackground={isMotionBackground}
            flexWeight={
              tabFlexWeight ?? (selected ? selectedFlexWeight : unselectedFlexWeight)
            }
            className={[panelClassName, tabPanelClassName].filter(Boolean).join(" ") || undefined}
          >
            {tab.content}
          </ComicPagePanel>
        );
      })}
    </ComicPageRow>
  );

  if (!ariaLabel) return row;

  return (
    <div role="group" aria-label={ariaLabel}>
      {row}
    </div>
  );
}
