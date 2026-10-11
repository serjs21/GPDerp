"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type AnimationEvent } from "react";
import { flippedFromTurns } from "./utils/dualityButtonUtils";
import {
  coverLayerAnimationOutcome,
  coverPhaseFlags,
  coverRotationView,
  prefersReducedMotion,
} from "./utils/coverStateUtils";

/**
 * Cover coin phase machine: covered → opening → uncovered → closing → covered, driven by the base
 * layer's CSS animation end. Also tracks the base's clockwise rotation (matches DualityButton baseWrap
 * turns after uncover) so the label arrow and frozen face follow it.
 */
export function useCoverPhase(params: {
  uncoveredProp: boolean | undefined;
  defaultUncovered: boolean;
  onUncoveredChange: ((uncovered: boolean) => void) | undefined;
  flippedProp: boolean | undefined;
  disabled: boolean;
  onFlippedChange: ((flipped: boolean) => void) | undefined;
}) {
  const { uncoveredProp, defaultUncovered, onUncoveredChange, flippedProp, disabled, onFlippedChange } = params;
  const isControlled = uncoveredProp != null;
  const [uncoveredInternal, setUncoveredInternal] = useState(defaultUncovered);
  const uncovered = isControlled ? uncoveredProp! : uncoveredInternal;
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [labelMounted, setLabelMounted] = useState(true);
  const wantFlipped = Boolean(flippedProp);
  /** Starts flipped when mounted open + flipped. */
  const [baseRotateDeg, setBaseRotateDeg] = useState(() => (uncovered && wantFlipped ? 180 : 0));
  const prevUncoveredRef = useRef(uncovered);

  const snapCovered = useCallback(() => {
    setOpening(false);
    setClosing(false);
    setLabelMounted(true);
    setBaseRotateDeg(0);
  }, []);

  useLayoutEffect(() => {
    const wasUncovered = prevUncoveredRef.current;
    prevUncoveredRef.current = uncovered;

    if (!uncovered && wasUncovered) {
      if (prefersReducedMotion()) {
        snapCovered();
        return;
      }
      setOpening(false);
      setLabelMounted(true);
      setClosing(true);
      return;
    }

    if (uncovered && !wasUncovered && !opening) {
      setClosing(false);
      setOpening(false);
    }
  }, [opening, snapCovered, uncovered]);

  const onOpenComplete = () => {
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    setOpening(false);
    setClosing(false);
    setBaseRotateDeg(wantFlipped ? 180 : 0);
  };

  const onCloseComplete = () => {
    setClosing(false);
    if (!isControlled) setUncoveredInternal(false);
  };

  const onCoverClick = () => {
    if (disabled || uncovered || opening || closing) return;
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    if (prefersReducedMotion()) {
      setOpening(false);
      setClosing(false);
      return;
    }
    setOpening(true);
  };

  const onLayerAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const outcome = coverLayerAnimationOutcome(event.animationName, opening, closing);
    if (outcome === "open") onOpenComplete();
    if (outcome === "close") onCloseComplete();
  };

  const handleFlippedChange = (flipped: boolean) => {
    setBaseRotateDeg((deg) => deg + 180);
    onFlippedChange?.(flipped);
  };

  const flags = coverPhaseFlags(uncovered, opening, closing);
  const { arrowFollowsBase } = flags;

  useEffect(() => {
    if (!arrowFollowsBase || !uncovered) return;
    setBaseRotateDeg((deg) => (flippedFromTurns(deg) === wantFlipped ? deg : deg + 180));
  }, [arrowFollowsBase, uncovered, wantFlipped]);

  const { labelBaseRotateDeg, coinFaceFlipped } = coverRotationView({
    uncovered,
    closing,
    arrowFollowsBase,
    baseRotateDeg,
    wantFlipped,
  });

  return {
    ...flags,
    opening,
    closing,
    labelMounted,
    labelBaseRotateDeg,
    /** Controlled face side for DualityButton; undefined keeps it uncontrolled. */
    faceFlipped: flippedProp === undefined ? undefined : coinFaceFlipped,
    onCoverClick,
    onLayerAnimationEnd,
    handleFlippedChange,
  };
}
