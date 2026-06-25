"use client";

import { useCallback, useRef, useState } from "react";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { HaikuDto } from "@/api/haikus";
import {
  computeStackStep,
  getMaxContentScrollTop,
  getRootFontSizePx,
  getStackSlotHeightPx,
  getWisdomForestCardCount,
} from "../wisdomForestStackScroll";

type UseWisdomForestStepScrollOptions = {
  haikus: HaikuDto[];
  generatingDraft?: GeneratingDraft | null;
};

export function useWisdomForestStepScroll({
  haikus,
  generatingDraft = null,
}: UseWisdomForestStepScrollOptions) {
  const forestRef = useRef<HTMLDivElement>(null);
  const cardCount = getWisdomForestCardCount(haikus, generatingDraft);
  const maxCardIndex = Math.max(0, cardCount - 1);
  const [activeCardIndex, setActiveCardIndex] = useState(maxCardIndex);

  const stepScroll = useCallback(
    (direction: -1 | 1) => {
      const root = forestRef.current;
      if (!root) return;
      const rootFontSizePx = getRootFontSizePx(root);
      const slotHeightPx = getStackSlotHeightPx(rootFontSizePx);
      const maxScroll = getMaxContentScrollTop(cardCount, slotHeightPx);
      const { scrollTop, activeCardIndex: nextIndex } = computeStackStep(
        root.scrollTop,
        direction,
        slotHeightPx,
        maxScroll,
        cardCount,
      );
      root.scrollTop = scrollTop;
      setActiveCardIndex(nextIndex);
    },
    [cardCount],
  );

  return {
    forestRef,
    activeCardIndex,
    setActiveCardIndex,
    stepScroll,
    maxCardIndex,
    cardCount,
  };
}
