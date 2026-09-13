"use client";

import { useRef } from "react";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useShareLinks } from "@/hooks/useShareLinks";
import { ShareLinkFilterPanels } from "./ShareLinkFilterPanels";
import { ShareLinkManagementRow } from "./ShareLinkManagementRow";
import { useShareLinkHaikuEnrichment } from "./useShareLinkHaikuEnrichment";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementProps = {
  active?: boolean;
};

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

  const isInitialPending = query.isPending && !query.isPlaceholderData;
  const isFilterRefetching =
    query.isFetching && !query.isFetchingNextPage && !isInitialPending;
  const showCenterLoader = isInitialPending || (items.length === 0 && isFilterRefetching);
  const showEmpty = items.length === 0 && !query.isFetching && !isInitialPending;
  const showBottomLoader = query.isFetchingNextPage || (items.length > 0 && isFilterRefetching);

  return (
    <div className={styles.root}>
      <ComicPagePanel
        background="solid"
        color="white"
        contentAlign="start"
        className={styles.searchPanel}
        ariaLabel="Search share links"
      >
        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            updateSearchParams({ filters, search: searchInput });
          }}
        >
          <ComicModalInput
            placeholder="Search by title"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search by title"
          />
        </form>
      </ComicPagePanel>

      <div className={styles.filtersCell}>
        <ShareLinkFilterPanels
          selected={filters}
          onChange={(next) => updateSearchParams({ filters: next, search })}
        />
      </div>

      <div ref={scrollRef} className={styles.listShell}>
        {showCenterLoader ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : showEmpty ? (
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
                onChanged={() => void query.refetch()}
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
      </div>
    </div>
  );
}
