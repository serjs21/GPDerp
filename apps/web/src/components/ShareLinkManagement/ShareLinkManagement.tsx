"use client";

import { useRef, type RefObject } from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useShareLinks } from "@/hooks/useShareLinks";
import { ShareLinkFilterPanels } from "./ShareLinkFilterPanels";
import { ShareLinkManagementRow } from "./ShareLinkManagementRow";
import { useShareLinkHaikuEnrichment } from "./useShareLinkHaikuEnrichment";
import styles from "./ShareLinkManagement.module.css";

const SEARCH_ACTION_FONT_SIZE = 18;
const SEARCH_ACTION_PADDING_X = 20;
const SEARCH_ACTION_PADDING_Y = 6;

export type ShareLinkManagementProps = {
  active?: boolean;
};

function SharpLabelButton({
  label,
  type = "button",
  onClick,
  className,
}: {
  label: string;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  const sharpShape = resolveComicLabelShapePreset("sharp");
  return (
    <button
      type={type}
      className={[styles.sharpAction, className].filter(Boolean).join(" ")}
      aria-label={label}
      onClick={onClick}
    >
      <ComicBurstLabel
        className={styles.sharpActionBurst}
        text={formatComicLabelText(label)}
        fill="#17131A"
        textColor="#ffffff"
        shapeKind={sharpShape.kind}
        spikeCount={sharpShape.spikeCount}
        randomness={sharpShape.randomness}
        seed={sharpShape.id}
        fontSize={SEARCH_ACTION_FONT_SIZE}
        paddingX={SEARCH_ACTION_PADDING_X}
        paddingY={SEARCH_ACTION_PADDING_Y}
        strokeWidth={3}
      />
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
          <SharpLabelButton label="Reset" onClick={onResetSearch} className={styles.resetAction} />
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

  const { getHaiku, isLoading: haikusLoading } = useShareLinkHaikuEnrichment(items, active);

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: Boolean(active && query.hasNextPage && !query.isFetchingNextPage),
  });

  const { showCenterLoader, showEmpty, showBottomLoader } = resolveListFlags(query, items.length);
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
          items={items}
          getHaiku={getHaiku}
          haikusLoading={haikusLoading}
          onChanged={() => void query.refetch()}
          sentinelRef={sentinelRef}
        />
      </div>
    </div>
  );
}
