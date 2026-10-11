"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, type UIEvent } from "react";
import { labelQueryKeys } from "@/api/labels";
import type { LabelSortValue } from "@/components/LabelSort";
import { sortLabelItems } from "@/components/LabelSort/utils/sortLabelItems";
import { useAccountLabels } from "@/hooks/useAccountLabels";

const PAGE_SIZE = 12;
/** Fetch the next page when the list is scrolled within this many px of its end. */
const NEXT_PAGE_THRESHOLD_PX = 80;

type SortedLabelPagesOptions = {
  accountId: string;
  active: boolean;
  query: string;
  sort: LabelSortValue;
};

/**
 * Paged account labels with connected-haiku previews. Server order by default; when a sort is
 * chosen, every remaining page is loaded and the list is sorted in memory.
 */
export function useSortedLabelPages({ accountId, active, query, sort }: SortedLabelPagesOptions) {
  const queryClient = useQueryClient();
  const { pagedLabels, hasNextPage, isFetchingNextPage, isPagedLoading, fetchNextPage, fetch } = useAccountLabels({
    accountId,
    autofetch: active && Boolean(accountId),
    pageSize: PAGE_SIZE,
    q: query,
    includeConnectedHaikus: true,
  });

  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    if (!active || !sort.categoryId) return;
    if (!hasNextPage || isFetchingNextPage) return;
    loadMore();
  }, [active, sort.categoryId, hasNextPage, isFetchingNextPage, loadMore]);

  const orderedLabels = useMemo(() => {
    if (!sort.categoryId || hasNextPage) return pagedLabels;
    return sortLabelItems(pagedLabels, sort);
  }, [pagedLabels, hasNextPage, sort]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: [...labelQueryKeys.all, "account", accountId, "paged"],
    });
    void fetch(true);
  }, [accountId, fetch, queryClient]);

  const loadMoreNearEnd = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > NEXT_PAGE_THRESHOLD_PX) return;
    if (!hasNextPage || isFetchingNextPage) return;
    loadMore();
  };

  return { pagedLabels, orderedLabels, isPagedLoading, isFetchingNextPage, refresh, loadMoreNearEnd };
}
