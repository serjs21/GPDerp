"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { prefersReducedMotion } from "@/components/Lantern/simulateFlight";
import { CREATION_ENTER_MS } from "./consts/creationPathLanternConsts";
import { EmptyPathPlaceholderLantern } from "./EmptyPathPlaceholderLantern";
import type { ShownPlaceholderLanternProps } from "./EmptyPathPlaceholder.types";
import { creationLanternTransformAtFlyT, defaultStopLanternTransform } from "./utils/lanternDisplay";

/**
 * Placeholder flying in along the creation path (same pose curve, duration and easing as a new
 * haiku), then parked on the focus stop. One element for both, so landing doesn't remount it and
 * replay the lantern's fade-in.
 */
export function ShownPlaceholderLantern({
  parsed,
  haiku,
  ariaLabel,
  entering,
  onEnterComplete,
}: ShownPlaceholderLanternProps) {
  const [flyT, setFlyT] = useState(0);
  // Flying in from off the path: skip the mount fade now, and never re-add it (that would replay it).
  const [suppressReveal] = useState(entering);

  useEffect(() => {
    if (!entering) return;
    if (prefersReducedMotion()) {
      onEnterComplete();
      return;
    }
    const controls = animate(0, 1, {
      duration: CREATION_ENTER_MS / 1000,
      ease: "easeOut",
      onUpdate: setFlyT,
      onComplete: onEnterComplete,
    });
    return () => controls.stop();
  }, [entering, onEnterComplete]);

  const transform = entering ? creationLanternTransformAtFlyT(parsed, flyT) : defaultStopLanternTransform(parsed);
  if (!transform) return null;

  return (
    <EmptyPathPlaceholderLantern
      haiku={haiku}
      transform={transform}
      ariaLabel={ariaLabel}
      isAnimating={entering}
      suppressReveal={suppressReveal}
    />
  );
}
