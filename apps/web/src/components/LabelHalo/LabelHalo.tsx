"use client";

import { createDraggable } from "animejs";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { useTranslations } from "next-intl";
import {
  LABEL_HALO_DROP_PAD_EXTRA_REM,
  LABEL_HALO_DROP_PAD_REM,
  type LabelHaloLabelItem,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import { LabelSlot } from "./LabelSlot";
import {
  clearDropAreaRoughOutline,
  paintDropAreaRoughOutline,
} from "./utils/dropAreaRoughOutline";
import { buildEnterStaggerDelays } from "@/components/ManageLabel/consts/magicAnimationConsts";
import { takeLabelBeltPuffIn } from "@/components/Lantern/utils/labelBeltEnterQueue";
import styles from "./LabelHalo.module.css";

export type LabelHaloProps = {
  labels: LabelHaloLabelItem[];
  /** Lantern (or other) content centered inside the padded drop area. */
  children?: ReactNode;
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the halo region. */
  ariaLabel?: string;
  /**
   * wrap — fit-content around children (Storybook).
   * fill — absolute overlay expanding pad outside a path-sized parent.
   */
  layout?: "wrap" | "fill";
  /** When false, labels render without drag/rotate. */
  interactive?: boolean;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function percentFromRect(
  el: HTMLElement,
  container: HTMLElement,
): { xPercent: number; yPercent: number } {
  const elRect = el.getBoundingClientRect();
  const box = container.getBoundingClientRect();
  const width = Math.max(1, box.width);
  const height = Math.max(1, box.height);
  const cx = elRect.left + elRect.width / 2 - box.left;
  const cy = elRect.top + elRect.height / 2 - box.top;
  return {
    xPercent: clampPercent((cx / width) * 100),
    yPercent: clampPercent((cy / height) * 100),
  };
}

type DraggableLabelProps = {
  label: LabelHaloLabelItem;
  rotateDeg: number;
  isDragging: boolean;
  interactive: boolean;
  dropRef: RefObject<HTMLDivElement | null>;
  outlineRef: RefObject<SVGSVGElement | null>;
  onDragActiveChange: (labelId: string, active: boolean) => void;
  onPositionDraft: (labelId: string, xPercent: number, yPercent: number) => void;
  onRotateDraft: (labelId: string, rotateDeg: number) => void;
  onPlacementCommit: (labelId: string, placement: LabelPlacement) => void;
  puffDelayMs?: number;
  onPuffEnd?: () => void;
};

function DraggableLabel({
  label,
  rotateDeg,
  isDragging,
  interactive,
  dropRef,
  outlineRef,
  onDragActiveChange,
  onPositionDraft,
  onRotateDraft,
  onPlacementCommit,
  puffDelayMs,
  onPuffEnd,
}: DraggableLabelProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const slotFocusRef = useRef<HTMLDivElement | null>(null);
  const rotateDegRef = useRef(rotateDeg);
  rotateDegRef.current = rotateDeg;
  const puffing = puffDelayMs != null;

  useEffect(() => {
    if (!interactive) return;
    const target = wrapRef.current;
    const visual = visualRef.current;
    const container = dropRef.current;
    if (!target || !visual || !container) return;

    const bakePosition = (draggable: {
      setX: (x: number, mute?: boolean) => void;
      setY: (y: number, mute?: boolean) => void;
    }) => {
      const drop = dropRef.current;
      if (!drop) return;
      // Anchor is 0×0 at the label center; percentFromRect of the visual is equivalent.
      const next = percentFromRect(visual, drop);
      target.style.left = `${next.xPercent}%`;
      target.style.top = `${next.yPercent}%`;
      draggable.setX(0, true);
      draggable.setY(0, true);
      onPositionDraft(label.id, next.xPercent, next.yPercent);
      return next;
    };

    const snapCenterUnderPointer = (draggable: {
      pointer: number[];
      setX: (x: number, mute?: boolean) => void;
      setY: (y: number, mute?: boolean) => void;
      x: number;
      y: number;
      coords: number[];
      transforms: {
        normalizePoint: (x: number, y: number) => { x: number; y: number };
      };
    }) => {
      // anime.js pointer is in inverse-ancestor-transform space, not client px.
      // Normalize the 0×0 wrap anchor the same way before zeroing grab offset.
      const anchor = target.getBoundingClientRect();
      const localAnchor = draggable.transforms.normalizePoint(anchor.left, anchor.top);
      const px = draggable.pointer[0] ?? 0;
      const py = draggable.pointer[1] ?? 0;
      draggable.setX(draggable.x + (px - localAnchor.x), true);
      draggable.setY(draggable.y + (py - localAnchor.y), true);
      draggable.coords[0] = draggable.coords[2] = draggable.x;
      draggable.coords[1] = draggable.coords[3] = draggable.y;
    };

    const instance = createDraggable(target, {
      trigger: visual,
      container,
      dragThreshold: 6,
      releaseStiffness: 0,
      releaseDamping: 0,
      onGrab: (self) => {
        snapCenterUnderPointer(self);
        onDragActiveChange(label.id, true);
        const svg = outlineRef.current;
        if (svg) paintDropAreaRoughOutline(svg);
        slotFocusRef.current?.focus({ preventScroll: true });
      },
      onRelease: (self) => {
        // handleUp starts a velocity throw BEFORE onRelease. Bake the on-screen
        // position, then kill that throw so settle cannot rebake a flung spot.
        const next = bakePosition(self);
        self.stop();
        self.setX(0, true);
        self.setY(0, true);
        self.coords[0] = self.coords[2] = 0;
        self.coords[1] = self.coords[3] = 0;
        onDragActiveChange(label.id, false);
        if (next) {
          onPlacementCommit(label.id, {
            xPercent: next.xPercent,
            yPercent: next.yPercent,
            rotateDeg: rotateDegRef.current,
          });
        }
      },
    });

    return () => {
      instance.revert();
    };
  }, [
    dropRef,
    outlineRef,
    interactive,
    label.id,
    onDragActiveChange,
    onPositionDraft,
    onPlacementCommit,
  ]);

  return (
    <div
      ref={wrapRef}
      className={[styles.slotWrap, isDragging ? styles.slotWrapDragging : ""]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${label.xPercent}%`,
        top: `${label.yPercent}%`,
      }}
    >
      <div
        ref={visualRef}
        className={styles.slotVisual}
      >
        <div
          className={puffing ? "magictime puffIn" : undefined}
          style={
            puffing && puffDelayMs! > 0
              ? { animationDelay: `${puffDelayMs}ms` }
              : undefined
          }
          onAnimationEnd={
            puffing
              ? (event) => {
                  if (!event.animationName.includes("puffIn")) return;
                  onPuffEnd?.();
                }
              : undefined
          }
        >
        <LabelSlot
          id={label.id}
          name={label.name}
          color={label.color}
          shape={label.shape}
          xPercent={label.xPercent}
          yPercent={label.yPercent}
          connection={label.connection ?? "start"}
          rotateDeg={rotateDeg}
          isDragging={isDragging}
          disabled={!interactive}
          showRotateControl={interactive}
          rootRef={(node) => {
            slotFocusRef.current = node;
          }}
          onRotateDraft={
            interactive ? (next) => onRotateDraft(label.id, next) : undefined
          }
          onPlacementCommit={
            interactive
              ? (placement) => onPlacementCommit(label.id, placement)
              : undefined
          }
        />
        </div>
      </div>
    </div>
  );
}

export function LabelHalo({
  labels,
  children,
  onPlacementCommit,
  className,
  style,
  ariaLabel,
  layout = "wrap",
  interactive = true,
}: LabelHaloProps) {
  const t = useTranslations("LabelHalo.halo");
  const dropRef = useRef<HTMLDivElement | null>(null);
  const outlineRef = useRef<SVGSVGElement | null>(null);
  const activeDragIdsRef = useRef<Set<string>>(new Set());

  const [draft, setDraft] = useState<LabelHaloLabelItem[]>(labels);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [puffDelays, setPuffDelays] = useState<Record<string, number>>({});
  const [rotateById, setRotateById] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const label of labels) map[label.id] = label.rotateDeg;
    return map;
  });
  const knownIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    setDraft(labels);
    setRotateById((prev) => {
      const next = { ...prev };
      for (const label of labels) {
        if (next[label.id] == null) next[label.id] = label.rotateDeg;
      }
      return next;
    });
  }, [labels]);

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

  const clearPuff = useCallback((labelId: string) => {
    setPuffDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  }, []);

  const onPositionDraft = useCallback((labelId: string, xPercent: number, yPercent: number) => {
    setDraft((current) =>
      current.map((label) =>
        label.id === labelId ? { ...label, xPercent, yPercent } : label,
      ),
    );
  }, []);

  const onDragActiveChange = useCallback((labelId: string, active: boolean) => {
    const set = activeDragIdsRef.current;
    if (active) set.add(labelId);
    else set.delete(labelId);
    setDraggingId(active ? labelId : set.size ? [...set][set.size - 1]! : null);
    if (set.size === 0) clearDropAreaRoughOutline(outlineRef.current);
  }, []);

  const onRotateDraft = useCallback((labelId: string, next: number) => {
    setRotateById((prev) => ({ ...prev, [labelId]: next }));
  }, []);

  const commitPlacement = useCallback(
    (labelId: string, placement: LabelPlacement) => {
      setRotateById((prev) => ({ ...prev, [labelId]: placement.rotateDeg }));
      setDraft((current) =>
        current.map((label) =>
          label.id === labelId
            ? {
                ...label,
                xPercent: placement.xPercent,
                yPercent: placement.yPercent,
                rotateDeg: placement.rotateDeg,
              }
            : label,
        ),
      );
      onPlacementCommit?.(labelId, placement);
    },
    [onPlacementCommit],
  );

  return (
    <div
      ref={dropRef}
      className={[
        styles.halo,
        layout === "fill" ? styles.haloFill : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          ...style,
          "--label-halo-pad": `${LABEL_HALO_DROP_PAD_REM}rem`,
          "--label-halo-pad-x": `${LABEL_HALO_DROP_PAD_REM + LABEL_HALO_DROP_PAD_EXTRA_REM}rem`,
          "--label-halo-pad-top": `${LABEL_HALO_DROP_PAD_REM + LABEL_HALO_DROP_PAD_EXTRA_REM}rem`,
          "--label-halo-pad-bottom": `${LABEL_HALO_DROP_PAD_REM}rem`,
        } as CSSProperties
      }
      role="region"
      aria-label={ariaLabel ?? t("ariaLabel")}
    >
      <div
        className={[
          styles.content,
          layout === "fill" ? styles.contentFill : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>

      {draggingId ? <div className={styles.dragBlocker} aria-hidden /> : null}

      <svg ref={outlineRef} className={styles.outline} aria-hidden />

      {draft.map((label) => (
        <DraggableLabel
          key={label.id}
          label={label}
          rotateDeg={rotateById[label.id] ?? label.rotateDeg}
          isDragging={draggingId === label.id}
          interactive={interactive}
          dropRef={dropRef}
          outlineRef={outlineRef}
          onDragActiveChange={onDragActiveChange}
          onPositionDraft={onPositionDraft}
          onRotateDraft={onRotateDraft}
          onPlacementCommit={commitPlacement}
          puffDelayMs={puffDelays[label.id]}
          onPuffEnd={() => clearPuff(label.id)}
        />
      ))}
    </div>
  );
}
