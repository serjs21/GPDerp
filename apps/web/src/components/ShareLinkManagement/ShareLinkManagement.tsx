"use client";

import { useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { SakuraPetalLoader } from "@/components/Loaders";
import { ShareLinksSort } from "@/components/ShareLinksSort";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useShareLinks } from "@/hooks/useShareLinks";
import { useShareLinkSocket } from "@/hooks/useShareLinkSocket";
import { ShareLinkFilterPanels } from "./ShareLinkFilterPanels";
import { ShareLinkManagementRow } from "./ShareLinkManagementRow";
import { useShareLinkHaikuEnrichment } from "./useShareLinkHaikuEnrichment";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementProps = {
  active?: boolean;
  /** When set, sort (rotated) + filters (2 per row) render here instead of above the list. */
  sidePanelTarget?: HTMLElement | null;
};

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
  items: ShareLinkListItem[];
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

export function ShareLinkManagement({
  active = true,
  sidePanelTarget = null,
}: ShareLinkManagementProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    query,
    items,
    filters,
    search,
    sort,
    updateSearchParams,
    onEnd,
  } = useShareLinks(active);

  useShareLinkSocket(active);

  const { getHaiku, isLoading: haikusLoading } = useShareLinkHaikuEnrichment(
    items,
    active,
  );

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: Boolean(active && query.hasNextPage && !query.isFetchingNextPage),
  });

  const { showCenterLoader, showEmpty, showBottomLoader } = resolveListFlags(
    query,
    items.length,
  );

  const onSortChange = (next: typeof sort) => updateSearchParams({ sort: next });
  const onFiltersChange = (next: typeof filters) =>
    updateSearchParams({ filters: next, search });

  return (
    <div
      className={[styles.root, sidePanelTarget ? styles.rootListOnly : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {sidePanelTarget ? (
        createPortal(
          <div className={styles.sideStack}>
            <ShareLinksSort
              value={sort}
              onChange={onSortChange}
              rotated
              className={styles.sortInSide}
            />
            <ShareLinkFilterPanels
              selected={filters}
              onChange={onFiltersChange}
              columns={2}
            />
          </div>,
          sidePanelTarget,
        )
      ) : (
        <>
          <div className={styles.controlsLeft}>
            <div className={styles.sortCell}>
              <ShareLinksSort value={sort} onChange={onSortChange} />
            </div>
          </div>

          <div className={styles.filtersCell}>
            <ShareLinkFilterPanels selected={filters} onChange={onFiltersChange} />
          </div>
        </>
      )}

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
