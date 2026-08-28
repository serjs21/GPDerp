"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { SVGPathHandle } from "@/components/SVGPath";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { shouldOpenCreationOverlay } from "./creationPathGate";

export function useCreationPathGate(
  generatingDraft: GeneratingDraft | null | undefined,
  pathRef: RefObject<SVGPathHandle | null>,
) {
  const [creationOpen, setCreationOpen] = useState(false);
  const handledRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!generatingDraft) return;
    if (handledRequestIdRef.current === generatingDraft.requestId) return;
    handledRequestIdRef.current = generatingDraft.requestId;

    const focusIndex = pathRef.current?.getFocusIndex() ?? 0;
    if (shouldOpenCreationOverlay(focusIndex)) {
      setCreationOpen(true);
      return;
    }

    pathRef.current?.scrollToTop();
  }, [generatingDraft, pathRef]);

  const onKeepScrolling = useCallback(() => {
    setCreationOpen(false);
  }, []);

  const onGoToHaiku = useCallback(() => {
    pathRef.current?.scrollToTop();
    setCreationOpen(false);
  }, [pathRef]);

  return {
    creationOpen,
    onKeepScrolling,
    onGoToHaiku,
  };
}
