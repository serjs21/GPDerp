"use client";

import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { resolveWisdomForestFields } from "../wisdomForestState";
import { useWisdomForestData } from "./useWisdomForestData";

type UseWisdomForestStateOptions = {
  pageSize?: number;
  generatingDraft?: GeneratingDraft | null;
  haikus?: HaikuDto[];
  isInitialLoading?: boolean;
  isFetchingNextPage?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onHaikuDeleted?: () => void;
};

export function useWisdomForestState({
  pageSize,
  generatingDraft = null,
  haikus,
  isInitialLoading,
  isFetchingNextPage,
  isError,
  hasNextPage,
  onLoadMore,
  onRetry,
  onHaikuDeleted,
}: UseWisdomForestStateOptions) {
  const isControlled = haikus !== undefined;
  const queried = useWisdomForestData(pageSize, { enabled: !isControlled });

  return resolveWisdomForestFields(
    isControlled,
    { haikus: haikus ?? [], isInitialLoading, isFetchingNextPage, isError, hasNextPage, onLoadMore, onRetry, onHaikuDeleted },
    queried,
    generatingDraft,
  );
}
