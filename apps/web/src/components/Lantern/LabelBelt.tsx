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
import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  LABEL_BELT_MAX_VISIBLE,
  LABEL_BELT_SPIKE_GAP,
  type LabelBeltSlot,
  type LabelBeltSlotId,
} from "./labelBeltLayout";
import { useLabelBeltPortalTransition } from "./useLabelBeltPortalTransition";
import styles from "./LabelBelt.module.css";

export type LabelBeltItem = {
  id: string;
  name: string;
  color: string;
};

export type LabelBeltProps = {
  labels: LabelBeltItem[];
  /** Override max visible slots (default 6). */
  maxVisible?: number;
  className?: string;
};

const ARROW_SRC = "/inkbrush-arrow.svg";

type SlotPush = { x: number; y: number };

type PortalTransition = {
  delta: 1 | -1;
  nextOffset: number;
  fromVisible: LabelBeltItem[];
  toVisible: LabelBeltItem[];
};

function remToPx(rem: string): number {
  const n = Number.parseFloat(rem);
  if (!Number.isFinite(n)) return 12;
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;width:1rem;visibility:hidden";
  document.body.appendChild(probe);
  const px = probe.offsetWidth || 16;
  probe.remove();
  return n * px;
}

function burstFor(label: LabelBeltItem) {
  return (
    <ComicBurstLabel text={formatComicLabelText(label.name)} fill={label.color} />
  );
}

/**
 * Side-column ComicBurstLabels (corners first, then mids).
 * Overflow rotates through a 6-slot ring with anime.js portal scroll.
 */
export function LabelBelt({
  labels,
  maxVisible = LABEL_BELT_MAX_VISIBLE,
  className,
}: LabelBeltProps) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const [transition, setTransition] = useState<PortalTransition | null>(null);
  const [pushes, setPushes] = useState<SlotPush[]>([]);
  const { busy, setLayerRef, runPortal } = useLabelBeltPortalTransition();

  const overflow = labels.length > maxVisible;
  const committedVisible = useMemo(
    () => rotateLabelsWindow(labels, rotationOffset, maxVisible),
    [labels, maxVisible, rotationOffset],
  );

  const displayOutgoing = transition?.fromVisible ?? committedVisible;
  const displayIncoming = transition?.toVisible ?? null;

  const slots = useMemo((): Array<LabelBeltSlot & { out: LabelBeltItem; inn: LabelBeltItem | null }> => {
    const base = buildLabelBeltSlots(displayOutgoing.length);
    return base.map((slot, index) => ({
      ...slot,
      out: displayOutgoing[index]!,
      inn: displayIncoming?.[index] ?? null,
    }));
  }, [displayOutgoing, displayIncoming]);

  const slotRefs = useRef<Map<LabelBeltSlotId, HTMLDivElement | null>>(new Map());
  const portalStartedFor = useRef<PortalTransition | null>(null);

  // Measure content boxes and push centers just outside the lantern edge.
  useLayoutEffect(() => {
    const spikePx = remToPx(LABEL_BELT_SPIKE_GAP);
    const next = slots.map((slot) => {
      const el = slotRefs.current.get(slot.id);
      const content = el?.querySelector("[data-comic-role='label']") as HTMLElement | null;
      const w = content?.offsetWidth ?? 48;
      const h = content?.offsetHeight ?? 28;
      return {
        x: slot.rectX * (w / 2 + spikePx),
        y: slot.rectY * (h / 2 + spikePx),
      };
    });
    setPushes((prev) => {
      if (
        prev.length === next.length &&
        prev.every((p, i) => Math.abs(p.x - next[i]!.x) < 0.5 && Math.abs(p.y - next[i]!.y) < 0.5)
      ) {
        return prev;
      }
      return next;
    });
  }, [slots]);

  // Start portal once dual layers are mounted for a pending transition.
  useLayoutEffect(() => {
    if (!transition) {
      portalStartedFor.current = null;
      return;
    }
    if (portalStartedFor.current === transition) return;
    portalStartedFor.current = transition;
    runPortal(transition.delta, () => {
      setRotationOffset(transition.nextOffset);
      setTransition(null);
    });
  }, [transition, runPortal]);

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
      {slots.map((slot, index) => {
        const push = pushes[index] ?? { x: 0, y: 0 };
        const rotating = Boolean(slot.inn);
        return (
          <div
            key={slot.id}
            ref={(el) => {
              slotRefs.current.set(slot.id, el);
            }}
            className={styles.slot}
            style={
              {
                left: `calc(50% + 50% * ${slot.rectX})`,
                top: `calc(50% + 50% * ${slot.rectY})`,
                transform: `translate(calc(-50% + ${push.x}px), calc(-50% + ${push.y}px)) rotate(${slot.rotateDeg}deg)`,
              } as CSSProperties
            }
          >
            <div className={styles.portal}>
              <div
                className={styles.portalLayer}
                ref={(el) => setLayerRef(slot.id, "out", el)}
              >
                {burstFor(slot.out)}
              </div>
              {rotating ? (
                <div
                  className={[styles.portalLayer, styles.portalLayerIncoming].join(" ")}
                  ref={(el) => setLayerRef(slot.id, "inn", el)}
                >
                  {burstFor(slot.inn!)}
                </div>
              ) : null}
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
