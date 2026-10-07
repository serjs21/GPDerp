import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import uniqBy from "lodash-es/uniqBy";

/** Page size for saved haiku list requests (must match product default). */
export const HAIKU_LIST_PAGE_SIZE = 20;

export type HaikuLinkedLabelDto = {
  id: string;
  name: string;
  color: string;
  shape: string;
  connectionPointId: string;
  rotateDeg: number;
  xPercent: number;
  yPercent: number;
};

export type HaikuDto = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: string;
  accountId: string;
  createdById: string;
  labels: HaikuLinkedLabelDto[];
};

export type HaikuListSuccess = {
  ok: true;
  data: {
    haikus: HaikuDto[];
    total: number;
    pageSize: number;
    offset: number;
  };
};

export type HaikuListErrorBody = { ok: false; error: string };

export type HaikuListResponse = HaikuListSuccess | HaikuListErrorBody;

export type FetchHaikusParams = {
  offset: number;
  pageSize?: number;
  accountId?: string;
  /** Case-insensitive title search on the API. */
  q?: string;
};

/**
 * GET /haiku — authenticated; lists haikus across the user’s workspaces (or filtered by accountId).
 */
export async function fetchHaikusPage(params: FetchHaikusParams): Promise<HaikuListSuccess> {
  const { offset, pageSize = HAIKU_LIST_PAGE_SIZE, accountId, q } = params;
  const { data } = await axios.get<HaikuListResponse>("/haiku", {
    params: {
      offset,
      pageSize,
      ...(accountId !== undefined && accountId !== "" ? { accountId } : {}),
      ...(q ? { q } : {}),
    },
  });

  if (!data.ok) {
    throw new Error(data.error ?? "Failed to load haikus");
  }

  return data;
}

type HaikuBatchResponse =
  | { ok: true; data: { haikus: HaikuDto[] } }
  | { ok: false; error: string };

/** POST /haiku/batch — authenticated; load lantern-ready haikus by id. */
export async function fetchHaikusByIds(ids: string[]): Promise<HaikuDto[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  const { data } = await axios.post<HaikuBatchResponse>("/haiku/batch", { ids: uniqueIds });
  if (!data.ok) throw new Error(data.error ?? "Failed to load haikus");
  return data.data.haikus;
}

export type DeleteHaikuResponse = { ok: true } | { ok: false; error: string };

export async function deleteHaiku(haikuId: string): Promise<void> {
  const { data } = await axios.delete<DeleteHaikuResponse>(`/haiku/${encodeURIComponent(haikuId)}`);
  if (!data.ok) {
    throw new Error("error" in data ? data.error : "Delete failed");
  }
}

export const haikuQueryKeys = {
  all: ["haikus"] as const,
  infiniteList: (pageSize: number) => [...haikuQueryKeys.all, "infinite", pageSize] as const,
  /** Kept apart from `infiniteList` so prepending new haikus only touches the unfiltered list. */
  searchLists: () => [...haikuQueryKeys.all, "search"] as const,
  searchList: (pageSize: number, q: string) => [...haikuQueryKeys.searchLists(), pageSize, q] as const,
};

/**
 * Flatten infinite-query pages in order, keeping the first occurrence of each id.
 * Prepended items lengthen page 1 without updating later fetch offsets, so the next
 * page from the API can repeat tail items from page 1 — dedupe fixes keys and display.
 */
export const flattenInfiniteHaikuPages = (pages: HaikuListSuccess[]): HaikuDto[] =>
  uniqBy(
    pages.flatMap((p) => p.data.haikus),
    (h) => h.id,
  );

/** Upsert newest item into the first infinite page (for WS `saved` without refetch). */
export function prependHaikuToInfiniteCache(
  queryClient: QueryClient,
  pageSize: number,
  haiku: HaikuDto,
): void {
  queryClient.setQueryData<InfiniteData<HaikuListSuccess, number>>(
    haikuQueryKeys.infiniteList(pageSize),
    (old) => {
      if (!old?.pages?.length) {
        return {
          pageParams: [0],
          pages: [
            {
              ok: true,
              data: {
                haikus: [haiku],
                total: 1,
                pageSize,
                offset: 0,
              },
            },
          ],
        };
      }
      const [first, ...rest] = old.pages;
      const exists = old.pages.some((p) => p.data.haikus.some((h) => h.id === haiku.id));
      if (exists) return old;
      return {
        ...old,
        pages: [
          {
            ...first,
            data: {
              ...first.data,
              haikus: [haiku, ...first.data.haikus],
              total: first.data.total + 1,
            },
          },
          ...rest,
        ],
      };
    },
  );
}

/** Remove a haiku from the infinite list and any search result caches (optimistic delete). */
export function removeHaikuFromInfiniteCache(
  queryClient: QueryClient,
  pageSize: number,
  haikuId: string,
): void {
  const removeFrom = (old: InfiniteData<HaikuListSuccess, number> | undefined) => {
    if (!old?.pages?.length) return old;
    const removed = old.pages.some((page) => page.data.haikus.some((h) => h.id === haikuId));
    if (!removed) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: {
          ...page.data,
          haikus: page.data.haikus.filter((h) => h.id !== haikuId),
          total: Math.max(0, page.data.total - 1),
        },
      })),
    };
  };
  queryClient.setQueryData<InfiniteData<HaikuListSuccess, number>>(
    haikuQueryKeys.infiniteList(pageSize),
    removeFrom,
  );
  queryClient.setQueriesData<InfiniteData<HaikuListSuccess, number>>(
    { queryKey: haikuQueryKeys.searchLists() },
    removeFrom,
  );
}
