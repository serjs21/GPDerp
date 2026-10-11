"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { CreationLayerState, HaikusRef } from "./SVGPath.types";

/**
 * Absolute creation overlay state: mounted across draft updates; on stream end the near path drops it
 * (list lantern owns stop-20) while the far path keeps the saved haiku under modal chrome until it closes.
 */
export function usePathCreationLayer(params: {
  generatingDraft: GeneratingDraft | null | undefined;
  haikus: HaikuDto[];
  haikusRef: HaikusRef;
  focusIndex: number;
  creationChromeOpen: boolean;
}) {
  const { generatingDraft, haikus, haikusRef, focusIndex, creationChromeOpen } = params;
  const [creationLayer, setCreationLayer] = useState<CreationLayerState | null>(null);
  const newestAtCreationStartRef = useRef<string | null>(null);

  // Keep absolute creation overlay mounted across draft updates; near vs far handoff differ.
  useLayoutEffect(() => {
    if (!generatingDraft) return;
    setCreationLayer((prev) => {
      if (prev?.requestId === generatingDraft.requestId) {
        return { ...prev, draft: generatingDraft, handoffHaiku: null };
      }
      newestAtCreationStartRef.current = haikusRef.current[0]?.id ?? null;
      return {
        requestId: generatingDraft.requestId,
        draft: generatingDraft,
        handoffHaiku: null,
        overlayOpacity: 1,
      };
    });
  }, [generatingDraft, haikusRef]);

  useLayoutEffect(() => {
    if (generatingDraft) return;
    setCreationLayer((prev) => {
      if (!prev?.draft) return prev;
      const newest = haikus[0];
      if (!newest || newest.id === newestAtCreationStartRef.current) {
        return creationChromeOpen ? prev : null;
      }

      if (focusIndex === 0) {
        // Near path: list lantern owns stop-20; drop overlay (no crossfade flicker).
        return null;
      }

      // Far path: keep path lantern under modal chrome until chrome closes.
      return {
        ...prev,
        draft: null,
        handoffHaiku: newest,
        overlayOpacity: 1,
      };
    });
  }, [generatingDraft, haikus, focusIndex, creationChromeOpen]);

  // Drop far-path overlay when modal chrome closes.
  const chromeClosedIdle = !creationChromeOpen && !generatingDraft;
  if (chromeClosedIdle && creationLayer && !creationLayer.draft) {
    setCreationLayer(null);
  }

  return creationLayer;
}
