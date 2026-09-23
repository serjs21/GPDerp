"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { SVGPathHandle } from "@/components/SVGPath";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { shouldOpenCreationOverlay } from "./creationPathGate";

export function useCreationPathGate(
  generatingDraft: GeneratingDraft | null | undefined,
  pathRef: RefObject<SVGPathHandle | null>,
) {
  const [creationOpen, setCreationOpen] = useState(false);
  const [creationHaiku, setCreationHaiku] = useState<HaikuDto | null>(null);
  const [creationSessionKey, setCreationSessionKey] = useState<string | null>(null);
  const handledRequestIdRef = useRef<string | null>(null);
  const staleDraftRef = useRef<GeneratingDraft | null>(null);

  useLayoutEffect(() => {
    if (!generatingDraft) return;
    if (handledRequestIdRef.current === generatingDraft.requestId) return;
    handledRequestIdRef.current = generatingDraft.requestId;

    staleDraftRef.current = generatingDraft;
    setCreationHaiku(null);
    setCreationSessionKey(generatingDraft.requestId);

    const focusIndex = pathRef.current?.getFocusIndex() ?? 0;

    if (shouldOpenCreationOverlay(focusIndex)) {
      setCreationOpen(true);
      return;
    }

    pathRef.current?.scrollToCreationSlot();
  }, [generatingDraft, pathRef]);

  useEffect(() => {
    if (generatingDraft) {
      staleDraftRef.current = generatingDraft;
      return;
    }

    if (!creationOpen) {
      staleDraftRef.current = null;
    }
  }, [creationOpen, generatingDraft]);

  const bindHaikuSaved = useCallback(
    (haiku: HaikuDto) => {
      if (creationOpen) {
        setCreationHaiku(haiku);
        staleDraftRef.current = null;
        return;
      }

      // Near path: snap focus to 0 so saved haiku replaces generating lantern at stop-20.
      pathRef.current?.snapToTop();
    },
    [creationOpen, pathRef],
  );

  const onKeepScrolling = useCallback(() => {
    setCreationOpen(false);
    setCreationHaiku(null);
    setCreationSessionKey(null);
    staleDraftRef.current = null;
  }, []);

  const onCreationHaikuDeleted = useCallback(() => {
    setCreationOpen(false);
    setCreationHaiku(null);
    setCreationSessionKey(null);
    staleDraftRef.current = null;
  }, []);

  const onGoToHaiku = useCallback(() => {
    pathRef.current?.scrollToTop();
    setCreationOpen(false);
    setCreationHaiku(null);
    setCreationSessionKey(null);
    staleDraftRef.current = null;
  }, [pathRef]);

  const modalGeneratingDraft =
    creationOpen && !creationHaiku
      ? (generatingDraft ?? staleDraftRef.current)
      : generatingDraft ?? null;

  return {
    creationOpen,
    creationHaiku,
    creationSessionKey,
    modalGeneratingDraft,
    onKeepScrolling,
    onGoToHaiku,
    onCreationHaikuDeleted,
    bindHaikuSaved,
  };
}
