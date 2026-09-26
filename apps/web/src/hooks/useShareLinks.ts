"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import {
  ALL_SHARE_LINK_FILTERS,
  fetchShareLinksPaged,
  shareLinkMatchesFilters,
  type ShareLinkFilter,
} from "@/api/shareLinks";
import {
  SHARE_LINKS_SORT_DEFAULT_VALUE,
  type ShareLinksSortValue,
} from "@/components/ShareLinksSort";
import { sortShareLinkItems } from "@/components/ShareLinksSort/utils/sortShareLinkItems";

const PAGE_SIZE = 50;
/** Cache list pages for an hour so sort/filter toggles can reuse loaded data. */
const SHARE_LINKS_STALE_MS = 60 * 60 * 1000;

const FILTER_SET = new Set<ShareLinkFilter>(ALL_SHARE_LINK_FILTERS);

const SORT_CATEGORY_IDS = new Set([
  "creationDate",
  "alpacabeth",
  "hitsLeft",
  "timeLeft",
]);

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

function parseSort(searchParams: URLSearchParams): ShareLinksSortValue {
  const categoryRaw = searchParams.get("sort");
  const categoryId =
    categoryRaw && SORT_CATEGORY_IDS.has(categoryRaw) ? categoryRaw : null;
  const direction = searchParams.get("dir") === "desc" ? "desc" : "asc";
  return { categoryId, direction };
}

export function useShareLinks(enabled: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(searchParams.get("filter")),
    [searchParams],
  );
  const search = (searchParams.get("search") ?? "").trim();
  const sort = useMemo(() => parseSort(searchParams), [searchParams]);

  const filterKey = serializeFilters(filters) ?? "all";

  const query = useInfiniteQuery({
    // Sort is applied in memory once all pages are loaded — keep it out of the key.
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
    staleTime: SHARE_LINKS_STALE_MS,
    gcTime: SHARE_LINKS_STALE_MS,
    enabled,
  });

  // When a sort is selected but more pages remain, finish loading so we can sort in memory.
  useEffect(() => {
    if (!enabled || !sort.categoryId) return;
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [
    enabled,
    sort.categoryId,
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
  ]);

  const items = useMemo(() => {
    const raw = query.data?.pages.flatMap((p) => p.items) ?? [];
    const filtered = raw.filter((link) => shareLinkMatchesFilters(link, filters));
    // In-memory sort only when the full result set is loaded.
    if (sort.categoryId && !query.hasNextPage) {
      return sortShareLinkItems(filtered, sort);
    }
    return filtered;
  }, [query.data?.pages, query.hasNextPage, filters, sort]);

  const updateSearchParams = useCallback(
    (next: {
      filters?: ShareLinkFilter[];
      search?: string;
      sort?: ShareLinksSortValue;
    }) => {
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
      if (next.sort !== undefined) {
        if (next.sort.categoryId) {
          params.set("sort", next.sort.categoryId);
          params.set("dir", next.sort.direction);
        } else {
          params.delete("sort");
          params.delete("dir");
        }
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
    sort: sort.categoryId ? sort : SHARE_LINKS_SORT_DEFAULT_VALUE,
    updateSearchParams,
    onEnd,
  };
}
