"use client";

import { useEffect, type RefObject } from "react";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";

function isFullyVisibleInRoot(element: HTMLElement, root: HTMLElement): boolean {
  const elRect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  return elRect.top >= rootRect.top && elRect.bottom <= rootRect.bottom;
}

function scrollCardWithinRoot(card: HTMLElement, root: HTMLElement): void {
  const rootRect = root.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  root.scrollTo({
    top: root.scrollTop + (cardRect.top - rootRect.top),
    behavior: "smooth",
  });
}

export function useScrollTopCardIntoView(
  scrollRootRef: RefObject<HTMLElement | null>,
  generatingDraft: GeneratingDraft | null | undefined,
): void {
  const contentLength = generatingDraft?.content.length ?? 0;
  const requestId = generatingDraft?.requestId;

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || !generatingDraft) return;

    const card = root.querySelector<HTMLElement>("[data-haiku-generating]");
    if (!card) return;

    if (!isFullyVisibleInRoot(card, root)) {
      scrollCardWithinRoot(card, root);
    }
  }, [generatingDraft, contentLength, requestId, scrollRootRef]);
}
