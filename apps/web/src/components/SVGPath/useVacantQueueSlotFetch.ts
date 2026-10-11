"use client";

import { useEffect, useRef } from "react";
import { shouldFetchNextQueuePage } from "./utils";

/** Requests the next page when focus nears the end of the loaded queue (not while a fetch runs). */
export function useVacantQueueSlotFetch(params: {
  onVacantQueueSlot: (() => void) | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  haikuCount: number;
  focusIndex: number;
}) {
  const { onVacantQueueSlot, hasNextPage, isFetchingNextPage, haikuCount, focusIndex } = params;
  const onVacantQueueSlotRef = useRef(onVacantQueueSlot);
  onVacantQueueSlotRef.current = onVacantQueueSlot;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (!shouldFetchNextQueuePage(haikuCount, focusIndex)) return;
    onVacantQueueSlotRef.current?.();
  }, [focusIndex, haikuCount, hasNextPage, isFetchingNextPage]);
}
