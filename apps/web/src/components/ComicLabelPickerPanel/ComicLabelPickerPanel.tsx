"use client";

import type { UIEvent } from "react";
import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicPressButton } from "@/components/ComicPressButton";
import { ComicModalSearchPanel } from "@/components/ComicModalInput";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { withDefaults } from "@/utils/props/withDefaults";
import { LabelPickerResults } from "./LabelPickerResults";
import { useLabelPickerSearch } from "./useLabelPickerSearch";
import { useLabelPickerSelection } from "./useLabelPickerSelection";
import { useStableLabelOrder } from "./useStableLabelOrder";
import styles from "./ComicLabelPickerPanel.module.css";

const SAVE_FILL = "#17131A";
const SAVE_DISABLED_FILL = "#9e9e9e";
const PAGE_SIZE = 12;
/** Fetch the next page when the list is scrolled within this many px of its end. */
const NEXT_PAGE_THRESHOLD_PX = 80;

export type ComicLabelPickerSeedLabel = {
  id: string;
  name: string;
  color: string;
  shape: string;
};

export type ComicLabelPickerPanelProps = {
  /** When false, skips fetch/seed until activated (inactive tab). */
  active: boolean;
  accountId: string;
  seedLabelIds: string[];
  /** Extra labels not yet in paged catalog (e.g. haiku labels). */
  knownLabels?: ComicLabelPickerSeedLabel[];
  footerLabel: string;
  onFooter: (selectedIds: string[]) => void;
  /** Fires whenever the in-panel selection changes (after seed or toggle). */
  onSelectionChange?: (selectedIds: string[]) => void;
  footerBusy?: boolean;
  footerDisabled?: boolean;
  /** When set, selecting beyond this count is ignored (deselect still works). */
  maxSelected?: number;
  /** Labels that cannot be selected (e.g. already chosen on the opposite filter tab). */
  disabledIds?: string[];
  className?: string;
};

const COMIC_LABEL_PICKER_PANEL_DEFAULTS = { footerBusy: false, footerDisabled: false };

export function ComicLabelPickerPanel(props: ComicLabelPickerPanelProps) {
  const { active, accountId, footerBusy, footerDisabled } = withDefaults(
    props,
    COMIC_LABEL_PICKER_PANEL_DEFAULTS,
  );
  const t = useTranslations("ComicLabelPickerPanel");
  const { searchRef, searchInput, setSearchInput, query } = useLabelPickerSearch(active);
  const { selectedIds, selectedIdSet, disabledIdSet, toggleLabel } = useLabelPickerSelection({
    active,
    seedLabelIds: props.seedLabelIds,
    disabledIds: props.disabledIds,
    maxSelected: props.maxSelected,
    onSelectionChange: props.onSelectionChange,
  });
  const { pagedLabels, hasNextPage, isFetchingNextPage, isPagedLoading, fetchNextPage } = useAccountLabels({
    accountId,
    autofetch: active && Boolean(accountId),
    pageSize: PAGE_SIZE,
    q: query,
  });
  const displayLabels = useStableLabelOrder({
    active,
    query,
    pagedLabels,
    knownLabels: props.knownLabels,
    selectedIds,
    seedLabelIds: props.seedLabelIds,
  });

  const onListScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > NEXT_PAGE_THRESHOLD_PX) return;
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const canSave = !footerDisabled && !footerBusy;

  return (
    <div className={[styles.root, props.className].filter(Boolean).join(" ")}>
      <ComicModalSearchPanel
        ref={searchRef}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder={t("filterPlaceholder")}
        aria-label={t("filterAriaLabel")}
        autoComplete="off"
        spellCheck={false}
      />

      <LabelPickerResults
        loading={isPagedLoading}
        fetchingNextPage={isFetchingNextPage}
        labels={displayLabels}
        selectedIdSet={selectedIdSet}
        disabledIdSet={disabledIdSet}
        onToggle={toggleLabel}
        onScroll={onListScroll}
      />

      <div className={styles.footerRow}>
        <ComicPressButton
          type="submit"
          className={styles.saveButton}
          disabled={!canSave}
          aria-busy={footerBusy || undefined}
          onClick={(event) => {
            event.preventDefault();
            props.onFooter(selectedIds);
          }}
        >
          <ComicBurstLabel
            className={styles.saveBurst}
            text={formatComicLabelText(props.footerLabel)}
            fill={canSave ? SAVE_FILL : SAVE_DISABLED_FILL}
            shapeKind="rect"
            stretch
          />
        </ComicPressButton>
      </div>
    </div>
  );
}
