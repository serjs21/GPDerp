"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchHaikusPage,
  flattenInfiniteHaikuPages,
  haikuQueryKeys,
  HAIKU_LIST_PAGE_SIZE,
} from "@/api/haikus";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";

export function useSavedHaikuCount() {
  const { isLoggedIn, initialized } = useAuthenticationState();

  const query = useInfiniteQuery({
    queryKey: haikuQueryKeys.infiniteList(HAIKU_LIST_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      fetchHaikusPage({ offset: pageParam as number, pageSize: HAIKU_LIST_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { offset, haikus, total } = lastPage.data;
      const loaded = offset + haikus.length;
      return loaded < total ? loaded : undefined;
    },
    enabled: initialized && isLoggedIn,
  });

  const count = useMemo(
    () => flattenInfiniteHaikuPages(query.data?.pages ?? []).length,
    [query.data?.pages],
  );

  const isListReady = initialized && (!isLoggedIn || !query.isPending);

  return { count, isListReady, isLoggedIn };
}
