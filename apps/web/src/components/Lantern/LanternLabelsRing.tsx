"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import { ComicLabel } from "@/components/ComicLabel/ComicLabel";
import { resolveComicLabelFill } from "@/components/ComicLabel/comicLabelColors";
import {
  LANTERN_LABEL_RING_MAX,
  LANTERN_LABEL_RING_RADIUS,
  ringAngleForIndex,
  rotateLabelsWindow,
  sourceDirectionFromOutwardAngle,
} from "./lanternLabelRingLayout";
import styles from "./LanternLabelsRing.module.css";

export type LanternRingLabel = {
  id: string;
  name: string;
  color: string;
};

export type LanternLabelsRingProps = {
  labels: LanternRingLabel[];
  /** Override max visible slots (default LANTERN_LABEL_RING_MAX). */
  maxVisible?: number;
  className?: string;
};

export function LanternLabelsRing({
  labels,
  maxVisible = LANTERN_LABEL_RING_MAX,
  className,
}: LanternLabelsRingProps) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const targetRefs = useRef(new Map<string, HTMLElement | null>());

  const overflow = labels.length > maxVisible;
  const visible = useMemo(
    () => rotateLabelsWindow(labels, rotationOffset, maxVisible),
    [labels, maxVisible, rotationOffset],
  );

  const slots = useMemo(() => {
    const count = visible.length;
    return visible.map((label, index) => {
      const angle = ringAngleForIndex(index, count);
      const sourceDirection = sourceDirectionFromOutwardAngle(angle);
      const x = 50 + Math.cos(angle) * LANTERN_LABEL_RING_RADIUS * 100;
      const y = 50 + Math.sin(angle) * LANTERN_LABEL_RING_RADIUS * 100;
      return { label, angle, sourceDirection, x, y };
    });
  }, [visible]);

  const targetsKey = useMemo(
    () =>
      slots
        .map(
          (slot) =>
            `${slot.label.id}:${slot.sourceDirection}:${resolveComicLabelFill(slot.label.color)}`,
        )
        .join("|"),
    [slots],
  );

  const getTargets = useCallback(
    () =>
      slots.map((slot) => ({
        element: targetRefs.current.get(slot.label.id) ?? null,
        style: "speech" as const,
        sourceDirection: slot.sourceDirection,
        backgroundColors: [resolveComicLabelFill(slot.label.color)],
      })),
    [slots],
  );

  const setTargetRef = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      targetRefs.current.set(id, node);
    } else {
      targetRefs.current.delete(id);
    }
  }, []);

  // #region agent log
  useEffect(() => {
    const id = window.setTimeout(() => {
      const canvases = document.querySelectorAll("canvas.comical-generated");
      const stages = document.querySelectorAll("[data-comic-bubble-stage]");
      const labelsEls = Array.from(document.querySelectorAll('[data-comic-role="label"]'));
      const stage = stages[0] as HTMLElement | undefined;
      const stageRect = stage?.getBoundingClientRect();
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "53a752",
        },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix",
          hypothesisId: "B-portal",
          location: "LanternLabelsRing.tsx:effect",
          message: "ring mount DOM snapshot",
          data: {
            labelCount: labels.length,
            visibleCount: visible.length,
            comicalCanvasCount: canvases.length,
            stageCount: stages.length,
            portaledStages: Array.from(stages).filter(
              (el) => (el as HTMLElement).dataset.renderInline === "false",
            ).length,
            labelElCount: labelsEls.length,
            stageParentIsBody: stage?.parentElement === document.body,
            targetOutside: labelsEls.slice(0, 6).map((el) => {
              if (!stageRect) return null;
              const r = el.getBoundingClientRect();
              return {
                outsideStage:
                  r.right < stageRect.left ||
                  r.left > stageRect.right ||
                  r.bottom < stageRect.top ||
                  r.top > stageRect.bottom,
                offsetLeft: (el as HTMLElement).offsetLeft,
                offsetTop: (el as HTMLElement).offsetTop,
                w: Math.round(r.width),
                h: Math.round(r.height),
              };
            }),
            canvases: Array.from(canvases).slice(0, 2).map((c) => {
              const canvas = c as HTMLCanvasElement;
              const r = canvas.getBoundingClientRect();
              return {
                w: Math.round(r.width),
                h: Math.round(r.height),
                parentIsBody: canvas.parentElement?.parentElement === document.body,
              };
            }),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }, 500);
    return () => window.clearTimeout(id);
  }, [labels.length, visible.length, targetsKey]);
  // #endregion

  if (labels.length === 0) return null;

  const rotatePrev = () => {
    setRotationOffset((prev) => prev - 1);
  };

  const rotateNext = () => {
    setRotationOffset((prev) => prev + 1);
  };

  const windowStart = ((rotationOffset % labels.length) + labels.length) % labels.length;

  return (
    <div className={[styles.overlay, className].filter(Boolean).join(" ")} aria-label="Haiku labels">
      <ComicBubbleStage
        active
        renderInline={false}
        targetsKey={targetsKey}
        getTargets={getTargets}
        className={styles.stage}
        anchorClassName={styles.stageAnchor}
      >
        {slots.map((slot) => (
          <ComicLabel
            key={slot.label.id}
            ref={(node) => setTargetRef(slot.label.id, node)}
            mode="embedded"
            name={slot.label.name}
            color={slot.label.color}
            sourceDirection={slot.sourceDirection}
            className={styles.slot}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          />
        ))}
      </ComicBubbleStage>

      {overflow ? (
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Previous labels"
            onClick={rotatePrev}
          >
            ‹
          </button>
          <span className={styles.navMeta} aria-live="polite">
            {windowStart + 1}/{labels.length}
          </span>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Next labels"
            onClick={rotateNext}
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
