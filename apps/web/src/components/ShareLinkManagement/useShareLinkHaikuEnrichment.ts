"use client";

import { keepPreviousData, useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { fetchHaikusByIds, type HaikuDto } from "@/api/haikus";

const CHUNK_SIZE = 50;
export const SHARE_LINK_HAIKUS_QUERY_KEY = "share-link-haikus";

/** Module-level so TanStack only re-runs it when a chunk result changes. */
function combineChunks(results: UseQueryResult<HaikuDto[]>[]) {
  const byId = new Map<string, HaikuDto>();
  for (const result of results) {
    for (const haiku of result.data ?? []) {
      byId.set(haiku.id, haiku);
    }
  }
  return { byId, anyFetching: results.some((result) => result.isFetching) };
}

function chunkIds(ids: string[]): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    chunks.push(ids.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export function useShareLinkHaikuEnrichment(items: ShareLinkListItem[], enabled: boolean) {
  const haikuIds = useMemo(() => {
    const ids = items
      .map((item) => item.sharedHaikuId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    return [...new Set(ids)].sort();
  }, [items]);

  const chunks = useMemo(() => chunkIds(haikuIds), [haikuIds]);

  const { byId, anyFetching } = useQueries({
    queries: chunks.map((ids) => ({
      queryKey: [SHARE_LINK_HAIKUS_QUERY_KEY, ids.join(",")] as const,
      queryFn: () => fetchHaikusByIds(ids),
      enabled: enabled && ids.length > 0,
      staleTime: 60_000,
      // Chunk keys change as pages add ids; keep the loaded haikus while the new chunk fetches.
      placeholderData: keepPreviousData,
    })),
    combine: combineChunks,
  });

  return {
    getHaiku: (haikuId: string | undefined) => (haikuId ? byId.get(haikuId) : undefined),
    /** Loaded, not needed, or the fetch finished without it (deleted haiku → title-only lantern). */
    isHaikuSettled: (haikuId: string | undefined) => !haikuId || byId.has(haikuId) || !anyFetching,
  };
}
