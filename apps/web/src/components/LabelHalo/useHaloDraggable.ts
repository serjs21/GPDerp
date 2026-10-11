"use client";

import { createDraggable } from "animejs";
import { useEffect, useRef, type RefObject } from "react";
import type { LabelPlacement } from "./consts/labelHaloConsts";
import { paintDropAreaRoughOutline } from "./utils/dropAreaRoughOutline";
import { percentFromRect } from "./utils/haloPlacementUtils";

type DraggableHandle = {
  setX: (x: number, mute?: boolean) => void;
  setY: (y: number, mute?: boolean) => void;
};

type GrabbedDraggable = DraggableHandle & {
  pointer: number[];
  x: number;
  y: number;
  coords: number[];
  transforms: {
    normalizePoint: (x: number, y: number) => { x: number; y: number };
  };
};

type HaloDraggableOptions = {
  interactive: boolean;
  labelId: string;
  rotateDeg: number;
  /** 0×0 anchor positioned at the label center (the anime.js draggable target). */
  wrapRef: RefObject<HTMLDivElement | null>;
  /** Visible label (the drag trigger). */
  visualRef: RefObject<HTMLDivElement | null>;
  /** Slot focused on grab so keyboard rotation follows the dragged label. */
  slotFocusRef: RefObject<HTMLDivElement | null>;
  dropRef: RefObject<HTMLDivElement | null>;
  outlineRef: RefObject<SVGSVGElement | null>;
  onDragActiveChange: (labelId: string, active: boolean) => void;
  onPositionDraft: (labelId: string, xPercent: number, yPercent: number) => void;
  onPlacementCommit: (labelId: string, placement: LabelPlacement) => void;
};

/**
 * anime.js drag of one halo label inside the drop area. On release the on-screen position is baked
 * into left/top percentages (killing anime's throw) and committed with the current rotation.
 */
export function useHaloDraggable({
  interactive,
  labelId,
  rotateDeg,
  wrapRef,
  visualRef,
  slotFocusRef,
  dropRef,
  outlineRef,
  onDragActiveChange,
  onPositionDraft,
  onPlacementCommit,
}: HaloDraggableOptions) {
  const rotateDegRef = useRef(rotateDeg);

  useEffect(() => {
    rotateDegRef.current = rotateDeg;
  }, [rotateDeg]);

  useEffect(() => {
    if (!interactive) return;
    const target = wrapRef.current;
    const visual = visualRef.current;
    const container = dropRef.current;
    if (!target || !visual || !container) return;

    const bakePosition = (draggable: DraggableHandle) => {
      const drop = dropRef.current;
      if (!drop) return;
      // Anchor is 0×0 at the label center; percentFromRect of the visual is equivalent.
      const next = percentFromRect(visual, drop);
      target.style.left = `${next.xPercent}%`;
      target.style.top = `${next.yPercent}%`;
      draggable.setX(0, true);
      draggable.setY(0, true);
      onPositionDraft(labelId, next.xPercent, next.yPercent);
      return next;
    };

    const snapCenterUnderPointer = (draggable: GrabbedDraggable) => {
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
        onDragActiveChange(labelId, true);
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
        onDragActiveChange(labelId, false);
        if (next) {
          onPlacementCommit(labelId, {
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
    wrapRef,
    visualRef,
    slotFocusRef,
    dropRef,
    outlineRef,
    interactive,
    labelId,
    onDragActiveChange,
    onPositionDraft,
    onPlacementCommit,
  ]);
}
