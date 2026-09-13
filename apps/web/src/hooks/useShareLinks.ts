"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_SHARE_LINK_FILTERS,
  fetchShareLinksPaged,
  shareLinkMatchesFilters,
  type ShareLinkFilter,
} from "@/api/shareLinks";

const PAGE_SIZE = 50;

const FILTER_SET = new Set<ShareLinkFilter>(ALL_SHARE_LINK_FILTERS);

function parseFilters(value: string | null): ShareLinkFilter[] {
  if (!value || value.trim().length === 0) return [...ALL_SHARE_LINK_FILTERS];
  const parsed = value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is ShareLinkFilter => FILTER_SET.has(part as ShareLinkFilter));
  const unique = [...new Set(parsed)];
  return unique.length > 0 ? unique : [...ALL_SHARE_LINK_FILTERS];
}

function serializeFilters(filters: ShareLinkFilter[]): string | undefined {
  const unique = ALL_SHARE_LINK_FILTERS.filter((id) => filters.includes(id));
  if (unique.length === 0 || unique.length === ALL_SHARE_LINK_FILTERS.length) return undefined;
  return unique.join(",");
}

export function useShareLinks(enabled: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(searchParams.get("filter")),
    [searchParams],
  );
  const search = (searchParams.get("search") ?? "").trim();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const filterKey = serializeFilters(filters) ?? "all";

  const query = useInfiniteQuery({
    queryKey: ["share-links", PAGE_SIZE, filterKey, search],
    queryFn: ({ pageParam }) =>
      fetchShareLinksPaged({
        pageSize: PAGE_SIZE,
        offset: pageParam as number,
        filters: serializeFilters(filters) ? filters : undefined,
        search: search || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.items.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
    enabled,
  });

  const items = useMemo(() => {
    const raw = query.data?.pages.flatMap((p) => p.items) ?? [];
    return raw.filter((link) => shareLinkMatchesFilters(link, filters));
  }, [query.data?.pages, filters]);

  const updateSearchParams = useCallback(
    (next: { filters?: ShareLinkFilter[]; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "share-links");
      if (next.filters !== undefined) {
        const serialized = serializeFilters(next.filters);
        if (serialized) params.set("filter", serialized);
        else params.delete("filter");
      }
      if (next.search !== undefined) {
        if (next.search.trim().length > 0) params.set("search", next.search.trim());
        else params.delete("search");
      }
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
    filters,
    search,
    searchInput,
    setSearchInput,
    updateSearchParams,
    onEnd,
  };
}
