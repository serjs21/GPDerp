"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  fetchHaikusPage,
  flattenInfiniteHaikuPages,
  haikuQueryKeys,
  HAIKU_LIST_PAGE_SIZE,
  type HaikuDto,
} from "@/api/haikus";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";

export type UseInfiniteHaikusQueryOptions = {
  pageSize?: number;
  enabled?: boolean;
  /** Title search sent to the API. Passing it (even empty) uses a separate search cache entry. */
  q?: string;
};

export function useInfiniteHaikusQuery({
  pageSize = HAIKU_LIST_PAGE_SIZE,
  enabled: enabledOverride,
  q,
}: UseInfiniteHaikusQueryOptions = {}) {
  const { isLoggedIn, initialized } = useAuthenticationState();
  const queryClient = useQueryClient();
  const enabled = enabledOverride ?? (initialized && isLoggedIn);

  const query = useInfiniteQuery({
    queryKey:
      q !== undefined ? haikuQueryKeys.searchList(pageSize, q) : haikuQueryKeys.infiniteList(pageSize),
    queryFn: ({ pageParam }) =>
      fetchHaikusPage({ offset: pageParam as number, pageSize, q: q || undefined }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { offset, haikus, total } = lastPage.data;
      const loaded = offset + haikus.length;
      return loaded < total ? loaded : undefined;
    },
    enabled,
  });

  const haikus = useMemo(
    () => flattenInfiniteHaikuPages(query.data?.pages ?? []),
    [query.data?.pages],
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: haikuQueryKeys.all });
  }, [queryClient]);

  return {
    haikus,
    isInitialLoading: query.isPending,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: () => void query.fetchNextPage(),
    refetch: () => void query.refetch(),
    invalidate,
    initialized,
    isLoggedIn,
  };
}

export type InfiniteHaikusQueryResult = ReturnType<typeof useInfiniteHaikusQuery>;

export type { HaikuDto };
