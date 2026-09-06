"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { toLabelBeltItems } from "@/components/Lantern/LabelBelt";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import {
  initialFlightCssVars,
  lanternTransformToFlightInput,
  prefersReducedMotion,
  runSteppedLanternFlight,
} from "@/components/Lantern/simulateFlight";
import styles from "./SVGPath.module.css";

export type ExitingPathLanternProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  onComplete: (haiku: HaikuDto) => void;
};

/** Owns fly-away after the path lantern unmounts from the optimistic list update. */
export function ExitingPathLantern({ haiku, transform, onComplete }: ExitingPathLanternProps) {
  const [flightStyle, setFlightStyle] = useState<CSSProperties>(() =>
    initialFlightCssVars(transform.positionMode),
  );
  const [flightExiting, setFlightExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    let cancelFlight: (() => void) | null = null;

    if (prefersReducedMotion()) {
      onCompleteRef.current(haiku);
      return;
    }

    setFlightExiting(true);
    setFlightStyle(initialFlightCssVars(transform.positionMode));

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return;
        const flightInput = lanternTransformToFlightInput(transform);
        const { promise, cancel } = runSteppedLanternFlight(flightInput, (style) => {
          if (!cancelled) setFlightStyle(style);
        });
        cancelFlight = cancel;
        void promise.then(() => {
          if (!cancelled) onCompleteRef.current(haiku);
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cancelFlight?.();
    };
  }, [haiku, transform]);

  return (
    <LanternFrame
      className={styles.lantern}
      transform={transform}
      style={flightStyle}
      flightExiting={flightExiting}
      widthRem={19}
      ariaLabel={`Deleting haiku: ${haiku.title ?? ""}`}
      labels={toLabelBeltItems(haiku.labels)}
    >
      <Lantern haiku={haiku} showActions={false} />
    </LanternFrame>
  );
}
