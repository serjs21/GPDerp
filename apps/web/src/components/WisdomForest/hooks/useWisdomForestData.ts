"use client";

import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";

const DEFAULT_PAGE_SIZE = 3;

type UseWisdomForestDataOptions = {
  enabled?: boolean;
};

export function useWisdomForestData(
  pageSize = DEFAULT_PAGE_SIZE,
  { enabled = true }: UseWisdomForestDataOptions = {},
) {
  const query = useInfiniteHaikusQuery({ pageSize, enabled });

  return {
    ready: query.initialized && query.isLoggedIn,
    haikus: query.haikus,
    isInitialLoading: query.isInitialLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    onLoadMore: query.fetchNextPage,
    onRetry: query.refetch,
    onHaikuDeleted: query.invalidate,
  };
}
