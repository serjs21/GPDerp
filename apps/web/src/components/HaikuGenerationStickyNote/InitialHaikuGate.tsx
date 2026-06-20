"use client";

import { useEffect, useState } from "react";
import { HaikuGenerationStickyNoteInitial } from "./HaikuGenerationStickyNoteInitial/HaikuGenerationStickyNoteInitial";

type InitialHaikuGateProps = {
  count: number;
  isListReady: boolean;
};

export function InitialHaikuGate({ count, isListReady }: InitialHaikuGateProps) {
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [initialRemoved, setInitialRemoved] = useState(false);

  // One-time freeze: eligible only when the list first reports zero saved haikus.
  /* eslint-disable react-hooks/set-state-in-effect -- eligibility is decided once per auth cycle (gate remounts via key) */
  useEffect(() => {
    if (!isListReady || eligible !== null) return;
    setEligible(count === 0);
  }, [isListReady, count, eligible]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showInitial = eligible === true && !initialRemoved;
  const washingOut = showInitial && count > 0;

  if (!showInitial) return null;

  return (
    <HaikuGenerationStickyNoteInitial
      washingOut={washingOut}
      onWashedOut={() => setInitialRemoved(true)}
    />
  );
}
