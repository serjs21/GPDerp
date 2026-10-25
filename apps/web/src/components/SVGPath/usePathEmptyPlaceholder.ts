"use client";

import { useCallback, useState } from "react";

/**
 * `idle`: parked on the focus stop. `entering`: creation fly-in. `exiting`: delete flight.
 * `gone`: not rendered.
 */
export type EmptyPathPlaceholderPhase = "idle" | "entering" | "exiting" | "gone";

/** Next phase for the current inputs; animations only start from a settled phase. */
export function nextEmptyPlaceholderPhase(
  phase: EmptyPathPlaceholderPhase,
  { eligible, generating }: { eligible: boolean; generating: boolean },
): EmptyPathPlaceholderPhase {
  const shown = phase === "idle" || phase === "entering";
  if (shown && (generating || !eligible)) return "exiting";
  if (phase === "gone" && eligible && !generating) return "entering";
  return phase;
}

/**
 * Placeholder lantern lifecycle on an empty path: shown (no animation) when the path first mounts
 * empty, flies away as soon as a generation starts or haikus appear, and flies back in when the
 * path empties again.
 */
export function usePathEmptyPlaceholder({ eligible, generating }: { eligible: boolean; generating: boolean }) {
  const [phase, setPhase] = useState<EmptyPathPlaceholderPhase>(() =>
    eligible && !generating ? "idle" : "gone",
  );
  const next = nextEmptyPlaceholderPhase(phase, { eligible, generating });
  if (next !== phase) setPhase(next);

  const onEnterComplete = useCallback(() => {
    setPhase((current) => (current === "entering" ? "idle" : current));
  }, []);
  const onExitComplete = useCallback(() => {
    setPhase((current) => (current === "exiting" ? "gone" : current));
  }, []);

  return { phase: next, onEnterComplete, onExitComplete };
}
