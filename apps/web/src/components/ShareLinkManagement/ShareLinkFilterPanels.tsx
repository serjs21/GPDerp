"use client";

import { useTranslations } from "next-intl";
import { ALL_SHARE_LINK_FILTERS, type ShareLinkFilter } from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { OverlayTitle } from "@/components/OverlayTitle";
import { SHARE_LINK_FILTER_OPTIONS } from "./consts/shareLinkFilterConsts";
import styles from "./ShareLinkFilterPanels.module.css";

export type ShareLinkFilterPanelsProps = {
  selected: ShareLinkFilter[];
  onChange: (next: ShareLinkFilter[]) => void;
  /** Panels per row: 4 (single row, default) or 2 (two rows, vertical layouts). */
  columns?: 2 | 4;
};

export function ShareLinkFilterPanels({
  selected,
  onChange,
  columns = 4,
}: ShareLinkFilterPanelsProps) {
  const t = useTranslations("ShareLinkManagement.filters");
  const selectedSet = new Set(selected);

  const toggle = (id: ShareLinkFilter) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(ALL_SHARE_LINK_FILTERS.filter((value) => next.has(value)));
  };

  return (
    <div
      className={[styles.group, columns === 2 ? styles.groupPairs : ""]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={t("groupAriaLabel")}
    >
      {SHARE_LINK_FILTER_OPTIONS.map((option) => {
        const checked = selectedSet.has(option.id);
        const title = t(`options.${option.messageKey}.title`);
        return (
          <OverlayTitle
            key={option.id}
            title={checked ? t("hideTitle", { title }) : t("showTitle", { title })}
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
              flexWeight={1}
              ariaLabel={
                checked
                  ? t(`options.${option.messageKey}.hideAriaLabel`)
                  : t(`options.${option.messageKey}.showAriaLabel`)
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
