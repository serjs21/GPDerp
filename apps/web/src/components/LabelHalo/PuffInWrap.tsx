"use client";

import type { AnimationEvent } from "react";
import type { PuffInWrapProps } from "./PuffInWrap.types";

/** Wrapper that plays the staggered puffIn for labels newly added to the halo. */
export function PuffInWrap({ delayMs, onPuffEnd, children }: PuffInWrapProps) {
  if (delayMs == null) return <div>{children}</div>;

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!event.animationName.includes("puffIn")) return;
    onPuffEnd?.();
  };

  return (
    <div
      className="magictime puffIn"
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
}
