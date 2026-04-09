import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import uniqBy from "lodash-es/uniqBy";

/** Page size for saved haiku list requests (must match product default). */
export const HAIKU_LIST_PAGE_SIZE = 3;

export type HaikuDto = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: string;
  accountId: string;
  createdById: string;
  labels: Array<{ id: string; name: string; color: string }>;
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
};

/**
 * GET /haiku — authenticated; lists haikus across the user’s workspaces (or filtered by accountId).
 */
export async function fetchHaikusPage(params: FetchHaikusParams): Promise<HaikuListSuccess> {
  const { offset, pageSize = HAIKU_LIST_PAGE_SIZE, accountId } = params;
  const { data } = await axios.get<HaikuListResponse>("/haiku", {
    params: {
      offset,
      pageSize,
      ...(accountId !== undefined && accountId !== "" ? { accountId } : {}),
    },
  });

  if (!data.ok) {
    throw new Error(data.error ?? "Failed to load haikus");
  }

  return data;
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
