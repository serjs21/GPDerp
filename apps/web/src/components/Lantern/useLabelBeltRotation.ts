"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { LabelBeltItem } from "./LabelBelt";
import type { LabelBeltDisplaySlot, LabelBeltPortalTransition } from "./LabelBelt.types";
import { buildLabelBeltSlots } from "./labelBeltLayout";
import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import { useLabelBeltPortalTransition } from "./useLabelBeltPortalTransition";

/**
 * Visible window over an overflowing label list, rotated one step at a time by a portal wipe:
 * slots show outgoing + incoming labels while the wipe runs, then commit the new offset.
 */
export function useLabelBeltRotation(labels: LabelBeltItem[], maxVisible: number) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const [transition, setTransition] = useState<LabelBeltPortalTransition | null>(null);
  const { busy, setLayerRef, runPortal, clearInlineStyles } = useLabelBeltPortalTransition();

  const overflow = labels.length > maxVisible;
  const committedVisible = useMemo(
    () => rotateLabelsWindow(labels, rotationOffset, maxVisible),
    [labels, maxVisible, rotationOffset],
  );

  const displayOutgoing = transition?.fromVisible ?? committedVisible;
  const displayIncoming = transition?.toVisible ?? null;

  const slots = useMemo((): LabelBeltDisplaySlot[] => {
    const base = buildLabelBeltSlots(displayOutgoing.length);
    return base.map((slot, index) => ({
      ...slot,
      out: displayOutgoing[index]!,
      inn: displayIncoming?.[index] ?? null,
    }));
  }, [displayOutgoing, displayIncoming]);

  const portalStartedFor = useRef<LabelBeltPortalTransition | null>(null);

  useLayoutEffect(() => {
    if (!transition) {
      portalStartedFor.current = null;
      // Idle commit: drop wipe transforms/sizes before paint (no end blink).
      clearInlineStyles();
      return;
    }
    if (portalStartedFor.current === transition) return;
    portalStartedFor.current = transition;
    runPortal({
      delta: transition.delta,
      onComplete: () => {
        setRotationOffset(transition.nextOffset);
        setTransition(null);
      },
    });
  }, [transition, runPortal, clearInlineStyles]);

  const step = (delta: 1 | -1) => {
    if (!overflow || busy || transition) return;
    const nextOffset = rotationOffset + delta;
    const fromVisible = committedVisible;
    const toVisible = rotateLabelsWindow(labels, nextOffset, maxVisible);
    setTransition({ delta, nextOffset, fromVisible, toVisible });
  };

  return {
    slots,
    transitionDelta: transition?.delta ?? null,
    navDisabled: busy || Boolean(transition),
    overflow,
    setLayerRef,
    step,
  };
}
