"use client";

import { ALL_SHARE_LINK_FILTERS, type ShareLinkFilter } from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { OverlayTitle } from "@/components/OverlayTitle";
import styles from "./ShareLinkFilterPanels.module.css";

const FILTER_OPTIONS: Array<{
  id: ShareLinkFilter;
  title: string;
  iconSrc: string;
  background: "sunburst" | "halftone" | "solid";
  color: "green" | "blue" | "orange" | "magenta";
  bubbleStyle: "circle" | "diamond" | "thought" | "rectangle";
  ariaLabel: string;
}> = [
  {
    id: "active",
    title: "Active",
    iconSrc: "/share_links_filter/active.svg",
    background: "sunburst",
    color: "green",
    bubbleStyle: "circle",
    ariaLabel: "Show active share links",
  },
  {
    id: "inactive",
    title: "Inactive",
    iconSrc: "/share_links_filter/inactive.svg",
    background: "halftone",
    color: "blue",
    bubbleStyle: "rectangle",
    ariaLabel: "Show inactive share links",
  },
  {
    id: "expired",
    title: "Expired",
    iconSrc: "/share_links_filter/expired.svg",
    background: "solid",
    color: "orange",
    bubbleStyle: "diamond",
    ariaLabel: "Show expired share links",
  },
  {
    id: "view_limit_reached",
    title: "0 hits left",
    iconSrc: "/share_links_filter/limit_reached.svg",
    background: "halftone",
    color: "magenta",
    bubbleStyle: "thought",
    ariaLabel: "Show share links that reached their view limit",
  },
];

export type ShareLinkFilterPanelsProps = {
  selected: ShareLinkFilter[];
  onChange: (next: ShareLinkFilter[]) => void;
};

export function ShareLinkFilterPanels({ selected, onChange }: ShareLinkFilterPanelsProps) {
  const selectedSet = new Set(selected);

  const toggle = (id: ShareLinkFilter) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(ALL_SHARE_LINK_FILTERS.filter((value) => next.has(value)));
  };

  return (
    <div className={styles.group} role="group" aria-label="Filter share links by status">
      {FILTER_OPTIONS.map((option) => {
        const checked = selectedSet.has(option.id);
        const action = checked ? "Hide" : "Show";
        return (
          <OverlayTitle
            key={option.id}
            title={`${action}\r\n ${option.title}`}
            direction="bottom"
            active={checked}
            className={[styles.slot, checked ? styles.slotChecked : ""].filter(Boolean).join(" ")}
          >
            <ComicPagePanel
              selectable
              selected={checked}
              onSelect={() => toggle(option.id)}
              background={option.background}
              color={option.color}
              isMotionBackground={false}
              shine={false}
              sunburstHalftone={false}
              flexWeight={1}
              ariaLabel={
                checked ? option.ariaLabel.replace(/^Show/, "Hide") : option.ariaLabel
              }
              className={[styles.panel, checked ? styles.panelChecked : styles.panelUnchecked].join(
                " ",
              )}
            >
              <LabelMethodIcon
                src={option.iconSrc}
                bubbleStyle={option.bubbleStyle}
                sourceDirection="none"
                active={checked}
              />
            </ComicPagePanel>
          </OverlayTitle>
        );
      })}
    </div>
  );
}
