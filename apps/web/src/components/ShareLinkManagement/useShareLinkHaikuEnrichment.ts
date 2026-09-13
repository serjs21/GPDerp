"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { fetchHaikusByIds, type HaikuDto } from "@/api/haikus";

const CHUNK_SIZE = 50;

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

  const queries = useQueries({
    queries: chunks.map((ids) => ({
      queryKey: ["share-link-haikus", ids.join(",")] as const,
      queryFn: () => fetchHaikusByIds(ids),
      enabled: enabled && ids.length > 0,
      staleTime: 60_000,
    })),
  });

  const byId = useMemo(() => {
    const map = new Map<string, HaikuDto>();
    for (const query of queries) {
      for (const haiku of query.data ?? []) {
        map.set(haiku.id, haiku);
      }
    }
    return map;
  }, [queries.map((query) => query.dataUpdatedAt).join("|")]);

  const isLoading =
    enabled &&
    haikuIds.length > 0 &&
    queries.some((query) => query.isPending || (query.isFetching && !query.data));

  return {
    getHaiku: (haikuId: string | undefined) => (haikuId ? byId.get(haikuId) : undefined),
    isLoading,
  };
}
