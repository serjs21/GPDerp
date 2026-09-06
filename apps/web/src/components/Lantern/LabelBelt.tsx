"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import {
  labelBeltStopInsetStyle,
  labelBeltStopTransformOrigin,
} from "./config";
import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  labelBeltPortalTravelSign,
  LABEL_BELT_MAX_VISIBLE,
  type LabelBeltSlot,
} from "./labelBeltLayout";
import { useLabelBeltPortalTransition } from "./useLabelBeltPortalTransition";
import styles from "./LabelBelt.module.css";

export type LabelBeltItem = {
  id: string;
  name: string;
  color: string;
  shape?: string;
};

export function toLabelBeltItems(
  labels: ReadonlyArray<{
    id: string;
    name: string;
    color?: string | null;
    shape?: string | null;
  }>,
): LabelBeltItem[] {
  return labels.map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color || "#888888",
    shape: label.shape ?? "classic",
  }));
}

export type LabelBeltProps = {
  labels: LabelBeltItem[];
  /** Override max visible slots (default 6). */
  maxVisible?: number;
  className?: string;
};

const ARROW_SRC = "/inkbrush-arrow.svg";

type PortalTransition = {
  delta: 1 | -1;
  nextOffset: number;
  fromVisible: LabelBeltItem[];
  toVisible: LabelBeltItem[];
};

function burstFor(label: LabelBeltItem) {
  const preset = resolveComicLabelShapePreset(label.shape);
  return (
    <ComicBurstLabel
      text={formatComicLabelText(label.name)}
      fill={label.color}
      shapeKind={preset.kind}
      spikeCount={preset.spikeCount}
      randomness={preset.randomness}
      seed={preset.id}
    />
  );
}

/**
 * Side-column ComicBurstLabels at LABEL_BELT_STOPS.
 * Overflow rotates with a stacked-block portal wipe: both labels are normal
 * flow blocks with 1rem gap; the portal clips; the entering block ends where idle sits.
 */
export function LabelBelt({
  labels,
  maxVisible = LABEL_BELT_MAX_VISIBLE,
  className,
}: LabelBeltProps) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const [transition, setTransition] = useState<PortalTransition | null>(null);
  const { busy, setLayerRef, runPortal, clearInlineStyles } =
    useLabelBeltPortalTransition();

  const overflow = labels.length > maxVisible;
  const committedVisible = useMemo(
    () => rotateLabelsWindow(labels, rotationOffset, maxVisible),
    [labels, maxVisible, rotationOffset],
  );

  const displayOutgoing = transition?.fromVisible ?? committedVisible;
  const displayIncoming = transition?.toVisible ?? null;

  const slots = useMemo((): Array<
    LabelBeltSlot & { out: LabelBeltItem; inn: LabelBeltItem | null }
  > => {
    const base = buildLabelBeltSlots(displayOutgoing.length);
    return base.map((slot, index) => ({
      ...slot,
      out: displayOutgoing[index]!,
      inn: displayIncoming?.[index] ?? null,
    }));
  }, [displayOutgoing, displayIncoming]);

  const portalStartedFor = useRef<PortalTransition | null>(null);

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

  if (labels.length === 0) return null;

  const windowStart = ((rotationOffset % labels.length) + labels.length) % labels.length;

  const step = (delta: 1 | -1) => {
    if (!overflow || busy || transition) return;
    const nextOffset = rotationOffset + delta;
    const fromVisible = committedVisible;
    const toVisible = rotateLabelsWindow(labels, nextOffset, maxVisible);
    setTransition({ delta, nextOffset, fromVisible, toVisible });
  };

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-label="Haiku label belt"
    >
      {slots.map((slot) => {
        const rotating = Boolean(slot.inn);
        const inset = labelBeltStopInsetStyle(slot.stop);
        /** +1 → inn above out (enter from top). −1 → out above inn (enter from bottom). */
        const sign = transition
          ? labelBeltPortalTravelSign(slot.id, transition.delta)
          : (1 as const);
        const innFirst = rotating && sign > 0;

        // Key by label id so the entering node can reconcile into idle without remount.
        const outBlock = (
          <div
            key={slot.out.id}
            className={styles.portalBlock}
            data-belt-layer="out"
            ref={(el) => setLayerRef(slot.id, "out", el)}
          >
            {burstFor(slot.out)}
          </div>
        );
        const innBlock = slot.inn ? (
          <div
            key={slot.inn.id}
            className={styles.portalBlock}
            data-belt-layer="inn"
            ref={(el) => setLayerRef(slot.id, "inn", el)}
          >
            {burstFor(slot.inn)}
          </div>
        ) : null;

        return (
          <div
            key={slot.id}
            className={styles.slot}
            data-belt-slot={slot.id}
            data-belt-side={slot.side}
            style={
              {
                ...inset,
                transform: `rotate(${slot.rotateDeg}deg)`,
                transformOrigin: labelBeltStopTransformOrigin(slot.side),
              } as CSSProperties
            }
          >
            <div className={styles.portal}>
              <div
                className={styles.portalStack}
                ref={(el) => setLayerRef(slot.id, "stack", el)}
              >
                {rotating ? (
                  innFirst ? (
                    <>
                      {innBlock}
                      {outBlock}
                    </>
                  ) : (
                    <>
                      {outBlock}
                      {innBlock}
                    </>
                  )
                ) : (
                  outBlock
                )}
              </div>
            </div>
          </div>
        );
      })}

      {overflow ? (
        <>
          <button
            type="button"
            className={[styles.navButton, styles.navPrev].join(" ")}
            aria-label="Previous labels"
            disabled={busy || Boolean(transition)}
            onClick={() => step(-1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
          <button
            type="button"
            className={[styles.navButton, styles.navNext].join(" ")}
            aria-label="Next labels"
            disabled={busy || Boolean(transition)}
            onClick={() => step(1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
          <p className={styles.navMeta} aria-live="polite">
            {windowStart + 1}/{labels.length}
          </p>
        </>
      ) : null}
    </div>
  );
}
