"use client";

import { useTranslations } from "next-intl";
import { useRef, type RefObject } from "react";
import { FetchingStaticLoader } from "@/components/Loaders/FetchingLoader";
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
  const t = useTranslations("ShareLinkManagement.list");
  if (showCenterLoader) {
    return (
      <div className={styles.loaderRow}>
        <FetchingStaticLoader className={styles.initialFetch} />
      </div>
    );
  }

  return (
    <>
      {showEmpty ? (
        <p className={styles.empty}>{t("empty")}</p>
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
          <FetchingStaticLoader className={styles.nextPageFetch} />
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

  return (
    <div className={styles.root}>
      <div className={styles.controlsLeft}>
        <div className={styles.sortCell}>
          <ShareLinksSort
            value={sort}
            onChange={(next) => updateSearchParams({ sort: next })}
          />
        </div>
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
