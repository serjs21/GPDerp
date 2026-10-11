"use client";

import { useEffect, useState } from "react";
import {
  ACTIVATING_DOT_CYCLE,
  ACTIVATING_DOT_MS,
  type ActivatingDots,
} from "@/consts/activating/activatingDotsConsts";

/** Cycling "", ".", "..", "..." while `active`; restarts from "" each time it turns on, "" when off. */
export function useActivatingDots(active: boolean): ActivatingDots {
  const [cycle, setCycle] = useState({ active, step: 0 });
  if (cycle.active !== active) setCycle({ active, step: 0 });

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setCycle((prev) => ({ ...prev, step: (prev.step + 1) % ACTIVATING_DOT_CYCLE.length }));
    }, ACTIVATING_DOT_MS);
    return () => window.clearInterval(id);
  }, [active]);

  return active ? ACTIVATING_DOT_CYCLE[cycle.step]! : "";
}
