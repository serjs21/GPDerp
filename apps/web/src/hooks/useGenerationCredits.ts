"use client";

import { useEffect, useState } from "react";
import {
  fetchCredits,
  GENERATION_CREDITS_UPDATED_EVENT,
  type GenerationCreditsUpdatedDetail,
} from "@/api/payments";

/** Fetches the credit balance on mount; only mount where the balance is displayed. */
export function useGenerationCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchCredits()
      .then((data) => {
        if (!cancelled) setCredits(data.credits);
      })
      .catch(() => {
        if (!cancelled) setCredits(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCredits(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onCreditsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<GenerationCreditsUpdatedDetail>).detail;
      if (typeof detail?.credits === "number") setCredits(detail.credits);
    };
    window.addEventListener(GENERATION_CREDITS_UPDATED_EVENT, onCreditsUpdated);
    return () => window.removeEventListener(GENERATION_CREDITS_UPDATED_EVENT, onCreditsUpdated);
  }, []);

  return { credits, loadingCredits };
}
