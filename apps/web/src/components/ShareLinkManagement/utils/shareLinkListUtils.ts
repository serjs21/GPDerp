import type { useShareLinks } from "@/hooks/useShareLinks";

type ShareLinksQuery = ReturnType<typeof useShareLinks>["query"];

function queryPhase(query: ShareLinksQuery) {
  const isInitialPending = query.isPending && !query.isPlaceholderData;
  const isFilterRefetching = query.isFetching && !query.isFetchingNextPage && !isInitialPending;
  return { isInitialPending, isFilterRefetching };
}

/**
 * Which loaders / empty state the list shows. `readyCount` is how many rows have their haiku
 * settled; rows that don't stay unrendered behind a loader.
 */
export function resolveShareLinkListFlags(query: ShareLinksQuery, itemCount: number, readyCount: number) {
  const { isInitialPending, isFilterRefetching } = queryPhase(query);
  const hasItems = itemCount > 0;
  return {
    showCenterLoader:
      isInitialPending || (!hasItems && isFilterRefetching) || (hasItems && readyCount === 0),
    showEmpty: !hasItems && !query.isFetching && !isInitialPending,
    showBottomLoader:
      query.isFetchingNextPage || (hasItems && isFilterRefetching) || readyCount < itemCount,
  };
}

/** Infinite scroll waits until every loaded row is shown, so pages don't pile up behind the loader. */
export function canLoadNextShareLinkPage(
  query: ShareLinksQuery,
  { active, revealed, allRowsReady }: { active: boolean; revealed: boolean; allRowsReady: boolean },
): boolean {
  return active && revealed && allRowsReady && Boolean(query.hasNextPage) && !query.isFetchingNextPage;
}
