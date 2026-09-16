"use client";

import { useEffect, useRef, type ReactNode } from "react";
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

const DEFAULT_SELECTED_FLEX_WEIGHT = 1.25;
const DEFAULT_UNSELECTED_FLEX_WEIGHT = 0.75;

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
  const wrapRef = useRef<HTMLDivElement>(null);

  // #region agent log
  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const titles = [...root.querySelectorAll("[class*='panelTitle']")].map((el) => {
      const cs = getComputedStyle(el);
      return { text: el.textContent?.trim(), color: cs.color, backgroundColor: cs.backgroundColor };
    });
    const localeTrigger = document.querySelector(
      "button[class*='TextBubbleDropdown-module'][class*='trigger'], button[class*='trigger']",
    );
    let localeTriggerBorder: string | null = null;
    let localeTriggerBg: string | null = null;
    if (localeTrigger instanceof HTMLElement) {
      const cs = getComputedStyle(localeTrigger);
      localeTriggerBorder = cs.borderColor;
      localeTriggerBg = cs.backgroundColor;
    }
    const rootCs = getComputedStyle(document.documentElement);
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8e01e4" },
      body: JSON.stringify({
        sessionId: "8e01e4",
        runId: "css-post-fix-2",
        hypothesisId: "F",
        location: "ComicPanelTabs.tsx:title-colors",
        message: "Panel title and locale trigger colors",
        data: {
          theme: document.documentElement.getAttribute("data-theme"),
          comicInk: rootCs.getPropertyValue("--comic-ink").trim(),
          sumiInk: rootCs.getPropertyValue("--sumi-ink").trim(),
          titles,
          localeTriggerBorder,
          localeTriggerBg,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [value, tabs]);
  // #endregion

  const row = (
    <ComicPageRow className={className}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        const {
          className: tabPanelClassName,
          flexWeight: tabFlexWeight,
          overflowVisible = true,
          isMotionBackground = false,
          shine = false,
          sunburstHalftone = false,
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
            shine={shine}
            sunburstHalftone={sunburstHalftone}
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

  return (
    <div ref={wrapRef} role={ariaLabel ? "group" : undefined} aria-label={ariaLabel}>
      {row}
    </div>
  );
}
