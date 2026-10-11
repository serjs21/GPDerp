"use client";

import { useEffect, useState } from "react";
import type { HaikuDto } from "@/api/haikus";

/**
 * Keeps a just-deleted haiku's lantern mounted (and the overlay open) while it plays its exit flight,
 * after the parent has already cleared `haiku` / closed the modal.
 */
export function useCreationLanternSession(open: boolean, haiku: HaikuDto | null | undefined) {
  const [exitingHaiku, setExitingHaiku] = useState<HaikuDto | null>(null);

  useEffect(() => {
    if (open && haiku) setExitingHaiku(null);
  }, [open, haiku]);

  return {
    activeHaiku: haiku ?? exitingHaiku,
    overlayOpen: open || exitingHaiku != null,
    startExit: setExitingHaiku,
    finishExit: () => setExitingHaiku(null),
  };
}
