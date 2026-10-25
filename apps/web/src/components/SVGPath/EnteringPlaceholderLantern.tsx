"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { prefersReducedMotion } from "@/components/Lantern/simulateFlight";
import { CREATION_ENTER_MS } from "./consts/creationPathLanternConsts";
import { EmptyPathPlaceholderLantern } from "./EmptyPathPlaceholderLantern";
import type { EnteringPlaceholderLanternProps } from "./EmptyPathPlaceholder.types";
import { creationLanternTransformAtFlyT } from "./utils/lanternDisplay";

/** Placeholder flying in along the creation path (same pose curve, duration and easing as a new haiku). */
export function EnteringPlaceholderLantern({ parsed, onComplete, ...lantern }: EnteringPlaceholderLanternProps) {
  const [flyT, setFlyT] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      onComplete();
      return;
    }
    const controls = animate(0, 1, {
      duration: CREATION_ENTER_MS / 1000,
      ease: "easeOut",
      onUpdate: setFlyT,
      onComplete,
    });
    return () => controls.stop();
  }, [onComplete]);

  const transform = creationLanternTransformAtFlyT(parsed, flyT);
  if (!transform) return null;
  return <EmptyPathPlaceholderLantern {...lantern} transform={transform} isAnimating showArrow={false} />;
}
