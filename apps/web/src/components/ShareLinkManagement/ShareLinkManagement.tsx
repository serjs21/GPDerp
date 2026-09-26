"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import {
  SHARE_LINKS_SORT_DEFAULT_VALUE,
  ShareLinksSort,
  type ShareLinksSortValue,
} from "@/components/ShareLinksSort";
import { sortShareLinkItems } from "@/components/ShareLinksSort/utils/sortShareLinkItems";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useShareLinks } from "@/hooks/useShareLinks";
import { useShareLinkSocket } from "@/hooks/useShareLinkSocket";
import { ShareLinkFilterPanels } from "./ShareLinkFilterPanels";
import { ShareLinkManagementRow } from "./ShareLinkManagementRow";
import { useShareLinkHaikuEnrichment } from "./useShareLinkHaikuEnrichment";
import styles from "./ShareLinkManagement.module.css";

/** Intrinsic sharp-label box: 8rem wide × 2.5rem tall (at 16px root). */
const SEARCH_ACTION_HEIGHT_PX = 40;
const SEARCH_ACTION_WIDTH_PX = 128;
const SEARCH_ACTION_PAD_X = (SEARCH_ACTION_WIDTH_PX - SEARCH_ACTION_HEIGHT_PX) / 2;

export type ShareLinkManagementProps = {
  active?: boolean;
};

function SharpLabelButton({
  label,
  type = "button",
  onClick,
  className,
  color = "#17131A",
}: {
  label: string;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  /** Background fill for the sharp comic label. */
  color?: string;
}) {
  const sharpShape = resolveComicLabelShapePreset("sharp");
  const display = formatComicLabelText(label);
  return (
    <button
      type={type}
      className={[styles.sharpAction, className].filter(Boolean).join(" ")}
      aria-label={label}
      onClick={onClick}
    >
      <ComicBurstLabel
        className={styles.sharpActionBurst}
        text={display}
        fill={color}
        textColor="#ffffff"
        shapeKind={sharpShape.kind}
        spikeCount={sharpShape.spikeCount}
        randomness={sharpShape.randomness}
        seed={sharpShape.id}
        fontSize={SEARCH_ACTION_HEIGHT_PX}
        paddingX={SEARCH_ACTION_PAD_X}
        paddingY={0}
        strokeWidth={3}
      >
        <span className={styles.sharpActionLabel}>{display}</span>
      </ComicBurstLabel>
    </button>
  );
}

function ShareLinkSearchCell({
  searchInput,
  hasActiveSearch,
  onSearchInputChange,
  onSubmitSearch,
  onResetSearch,
}: {
  searchInput: string;
  hasActiveSearch: boolean;
  onSearchInputChange: (value: string) => void;
  onSubmitSearch: () => void;
  onResetSearch: () => void;
}) {
  return (
    <form
      className={styles.searchCell}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitSearch();
      }}
    >
      <ComicPagePanel
        background="solid"
        color="white"
        contentAlign="start"
        className={styles.searchInputPanel}
        ariaLabel="Search share links"
      >
        <ComicModalInput
          className={styles.searchInput}
          placeholder="Search by title"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          aria-label="Search by title"
        />
      </ComicPagePanel>

      <div
        className={[
          styles.searchActions,
          hasActiveSearch ? styles.searchActionsSplit : styles.searchActionsEnd,
        ].join(" ")}
      >
        {hasActiveSearch ? (
          <SharpLabelButton label="Reset" onClick={onResetSearch} color="#940000" className={styles.resetAction} />
        ) : null}
        <SharpLabelButton label="Search" type="submit" className={styles.searchAction} />
      </div>
    </form>
  );
}

function ShareLinkListBody({
  showCenterLoader,
  showEmpty,
  showBottomLoader,
  items,
  getHaiku,
  haikusLoading,
  onChanged,
  sentinelRef,
}: {
  showCenterLoader: boolean;
  showEmpty: boolean;
  showBottomLoader: boolean;
  items: ReturnType<typeof useShareLinks>["items"];
  getHaiku: ReturnType<typeof useShareLinkHaikuEnrichment>["getHaiku"];
  haikusLoading: boolean;
  onChanged: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  if (showCenterLoader) {
    return (
      <div className={styles.loaderRow}>
        <SakuraPetalLoader />
      </div>
    );
  }

  return (
    <>
      {showEmpty ? (
        <p className={styles.empty}>No share links found.</p>
      ) : (
        items.map((link) => {
          const haikuId = link.sharedHaikuId;
          const haiku = getHaiku(haikuId);
          return (
            <ShareLinkManagementRow
              key={link.id}
              link={link}
              haiku={haiku}
              haikuLoading={Boolean(haikuId) && !haiku && haikusLoading}
              onChanged={onChanged}
            />
          );
        })
      )}
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      {showBottomLoader ? (
        <div className={styles.loaderRow}>
          <SakuraPetalLoader />
        </div>
      ) : null}
    </>
  );
}

function resolveListFlags(query: ReturnType<typeof useShareLinks>["query"], itemCount: number) {
  const isInitialPending = query.isPending && !query.isPlaceholderData;
  const isFilterRefetching =
    query.isFetching && !query.isFetchingNextPage && !isInitialPending;
  return {
    showCenterLoader: isInitialPending || (itemCount === 0 && isFilterRefetching),
    showEmpty: itemCount === 0 && !query.isFetching && !isInitialPending,
    showBottomLoader: query.isFetchingNextPage || (itemCount > 0 && isFilterRefetching),
  };
}

export function ShareLinkManagement({ active = true }: ShareLinkManagementProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<ShareLinksSortValue>(SHARE_LINKS_SORT_DEFAULT_VALUE);

  const {
    query,
    items,
    filters,
    search,
    searchInput,
    setSearchInput,
    updateSearchParams,
    onEnd,
  } = useShareLinks(active);

  useShareLinkSocket(active);

  const sortedItems = useMemo(
    () => sortShareLinkItems(items, sort),
    [items, sort],
  );

  const { getHaiku, isLoading: haikusLoading } = useShareLinkHaikuEnrichment(
    sortedItems,
    active,
  );

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: Boolean(active && query.hasNextPage && !query.isFetchingNextPage),
  });

  const { showCenterLoader, showEmpty, showBottomLoader } = resolveListFlags(
    query,
    sortedItems.length,
  );
  const hasActiveSearch = search.trim().length > 0;

  return (
    <div className={styles.root}>
      <ShareLinkSearchCell
        searchInput={searchInput}
        hasActiveSearch={hasActiveSearch}
        onSearchInputChange={setSearchInput}
        onSubmitSearch={() => updateSearchParams({ filters, search: searchInput })}
        onResetSearch={() => {
          setSearchInput("");
          updateSearchParams({ filters, search: "" });
        }}
      />

      <div className={styles.sortCell}>
        <ShareLinksSort value={sort} onChange={setSort} />
      </div>

      <div className={styles.filtersCell}>
        <ShareLinkFilterPanels
          selected={filters}
          onChange={(next) => updateSearchParams({ filters: next, search })}
        />
      </div>

      <div ref={scrollRef} className={styles.listShell}>
        <ShareLinkListBody
          showCenterLoader={showCenterLoader}
          showEmpty={showEmpty}
          showBottomLoader={showBottomLoader}
          items={sortedItems}
          getHaiku={getHaiku}
          haikusLoading={haikusLoading}
          onChanged={() => void query.refetch()}
          sentinelRef={sentinelRef}
        />
      </div>
    </div>
  );
}
