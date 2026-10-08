"use client";

import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { buildEnterStaggerDelays } from "@/components/ManageLabel/consts/magicAnimationConsts";
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
import { takeLabelBeltPuffIn } from "./utils/labelBeltEnterQueue";
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
  excludeLabelIds?: ReadonlyArray<string> | ReadonlySet<string>,
): LabelBeltItem[] {
  const exclude =
    excludeLabelIds == null
      ? null
      : excludeLabelIds instanceof Set
        ? excludeLabelIds
        : new Set(excludeLabelIds);
  return labels
    .filter((label) => !exclude?.has(label.id))
    .map((label) => ({
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

const ARROW_SRC = "/lantern/inkbrush-arrow.svg";

type PortalTransition = {
  delta: 1 | -1;
  nextOffset: number;
  fromVisible: LabelBeltItem[];
  toVisible: LabelBeltItem[];
};

function burstFor(
  label: LabelBeltItem,
  options?: { puffDelayMs?: number; onPuffEnd?: () => void },
) {
  const preset = resolveComicLabelShapePreset(label.shape);
  const puffing = options?.puffDelayMs != null;
  return (
    <div
      className={puffing ? "magictime puffIn" : undefined}
      style={
        puffing && options.puffDelayMs! > 0
          ? { animationDelay: `${options.puffDelayMs}ms` }
          : undefined
      }
      onAnimationEnd={
        puffing
          ? (event: AnimationEvent<HTMLDivElement>) => {
              if (!event.animationName.includes("puffIn")) return;
              options.onPuffEnd?.();
            }
          : undefined
      }
    >
      <ComicBurstLabel
        text={formatComicLabelText(label.name)}
        fill={label.color}
        shapeKind={preset.kind}
        spikeCount={preset.spikeCount}
        randomness={preset.randomness}
        seed={preset.id}
      />
    </div>
  );
}

/**
 * Side-column ComicBurstLabels at LABEL_BELT_STOPS.
 * Overflow rotates with a stacked-block portal wipe: both labels are normal
 * flow blocks with 1rem gap; the portal clips; the entering block ends where idle sits.
 */
export const LabelBelt = memo(function LabelBelt({
  labels,
  maxVisible = LABEL_BELT_MAX_VISIBLE,
  className,
}: LabelBeltProps) {
  const t = useTranslations("Lantern.labelBelt");
  const [rotationOffset, setRotationOffset] = useState(0);
  const [transition, setTransition] = useState<PortalTransition | null>(null);
  const [puffDelays, setPuffDelays] = useState<Record<string, number>>({});
  const { busy, setLayerRef, runPortal, clearInlineStyles } =
    useLabelBeltPortalTransition();
  const knownIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const currentIds = labels.map((label) => label.id);
    const currentSet = new Set(currentIds);
    const queued = takeLabelBeltPuffIn(currentSet);

    if (knownIdsRef.current == null) {
      knownIdsRef.current = currentSet;
      if (queued.length === 0) return;
    }

    const added =
      queued.length > 0
        ? queued
        : currentIds.filter((id) => !knownIdsRef.current!.has(id));

    knownIdsRef.current = currentSet;

    if (added.length === 0) return;

    const batch = buildEnterStaggerDelays(added);
    setPuffDelays((prev) => {
      const next = { ...prev };
      for (const [id, delay] of Object.entries(batch)) {
        if (id in next) continue;
        next[id] = delay;
      }
      return next;
    });
  }, [labels]);

  const clearPuff = (labelId: string) => {
    setPuffDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  };

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

  const step = (delta: 1 | -1) => {
    if (!overflow || busy || transition) return;
    const nextOffset = rotationOffset + delta;
    const fromVisible = committedVisible;
    const toVisible = rotateLabelsWindow(labels, nextOffset, maxVisible);
    setTransition({ delta, nextOffset, fromVisible, toVisible });
  };

  const renderBurst = (label: LabelBeltItem) => {
    const delay = puffDelays[label.id];
    return burstFor(label, {
      puffDelayMs: delay,
      onPuffEnd: () => clearPuff(label.id),
    });
  };

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-label={t("ariaLabel")}
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
            {renderBurst(slot.out)}
          </div>
        );
        const innBlock = slot.inn ? (
          <div
            key={slot.inn.id}
            className={styles.portalBlock}
            data-belt-layer="inn"
            ref={(el) => setLayerRef(slot.id, "inn", el)}
          >
            {renderBurst(slot.inn)}
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
            aria-label={t("previous")}
            disabled={busy || Boolean(transition)}
            onClick={() => step(-1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
          <button
            type="button"
            className={[styles.navButton, styles.navNext].join(" ")}
            aria-label={t("next")}
            disabled={busy || Boolean(transition)}
            onClick={() => step(1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
        </>
      ) : null}
    </div>
  );
});
