"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchShareLinksPaged, type ShareLinkFilter } from "@/api/shareLinks";

const PAGE_SIZE = 50;

function parseFilter(value: string | null): ShareLinkFilter | undefined {
  const normalized = (value ?? "").toLowerCase();
  if (
    normalized === "active" ||
    normalized === "inactive" ||
    normalized === "expired" ||
    normalized === "view_limit_reached"
  ) {
    return normalized;
  }
  return undefined;
}

export function useShareLinks(enabled: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filter = parseFilter(searchParams.get("filter"));
  const search = (searchParams.get("search") ?? "").trim();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: ["share-links", PAGE_SIZE, filter ?? "all", search],
    queryFn: ({ pageParam }) =>
      fetchShareLinksPaged({
        pageSize: PAGE_SIZE,
        offset: pageParam as number,
        filter,
        search: search || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.items.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled,
  });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data?.pages]);

  const updateSearchParams = useCallback(
    (next: { filter?: ShareLinkFilter; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "share-links");
      if (next.filter) params.set("filter", next.filter);
      else params.delete("filter");
      if (next.search && next.search.trim().length > 0) params.set("search", next.search.trim());
      else params.delete("search");
      const queryString = params.toString();
      router.replace(`/settings?${queryString}`);
    },
    [router, searchParams],
  );

  const onEnd = useCallback(() => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query]);

  return {
    query,
    items,
    filter,
    search,
    searchInput,
    setSearchInput,
    updateSearchParams,
    onEnd,
  };
}
