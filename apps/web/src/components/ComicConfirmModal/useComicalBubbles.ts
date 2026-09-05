"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { buildBubbleSpec, type ComicBubbleStyle } from "./comicBubblePresets";
import { applySourceDirectionToSpec, type ComicSourceDirection } from "./comicSourceDirection";

export type ComicalBubbleTarget = {
  element: HTMLElement | null;
  style: ComicBubbleStyle;
  isQuestion?: boolean;
  sourceDirection?: ComicSourceDirection;
  backgroundColors?: string[];
};

type ComicalModule = typeof import("comicaljs");

let comicalModulePromise: Promise<ComicalModule> | null = null;

/** Comical only allows one active edit root; track the owner stage globally. */
let editingStageEl: HTMLElement | null = null;

function claimEditingStage(stage: HTMLElement) {
  editingStageEl = stage;
}

function releaseEditingStage(stage: HTMLElement | null) {
  if (stage) {
    if (editingStageEl === stage) editingStageEl = null;
    return;
  }
  editingStageEl = null;
}

function isClaimedEditingStage(stage: HTMLElement) {
  return editingStageEl === stage;
}

function loadComical(): Promise<ComicalModule> {
  if (!comicalModulePromise) {
    comicalModulePromise = import("comicaljs");
  }
  return comicalModulePromise;
}

function applySpecs(comical: ComicalModule, targets: ComicalBubbleTarget[]) {
  const { Bubble } = comical;
  for (const target of targets) {
    if (!target.element) continue;
    const bubble = new Bubble(target.element);
    const spec = buildBubbleSpec(target.element, target.style, Bubble.getDefaultBubbleSpec, {
      isQuestion: target.isQuestion,
      backgroundColors: target.backgroundColors,
    });
    bubble.setBubbleSpec(
      applySourceDirectionToSpec(target.element, spec, target.sourceDirection, target.style, {
        isQuestion: target.isQuestion,
      }),
    );
  }
}

function stopComicalEditing(comical: ComicalModule | null) {
  if (!comical) return;
  try {
    comical.Comical.stopEditing();
  } catch {
    // ignore double teardown
  }
}

function syncSpecs(
  comical: ComicalModule | null,
  stage: HTMLElement | null,
  editing: boolean,
  getTargets: () => ComicalBubbleTarget[],
) {
  if (!comical || !stage || !editing || !isClaimedEditingStage(stage)) return;
  applySpecs(comical, getTargets());
  try {
    comical.Comical.update(stage);
    comical.Comical.hideHandles();
  } catch {
    // ignore races while mounting
  }
}

function canvasMatchesStage(canvas: HTMLCanvasElement, stage: HTMLElement): boolean {
  return canvas.clientWidth === stage.clientWidth && canvas.clientHeight === stage.clientHeight;
}

function restartEditingIfCanvasStale(
  comical: ComicalModule,
  stage: HTMLElement,
  getTargets: () => ComicalBubbleTarget[],
): boolean {
  if (!isClaimedEditingStage(stage)) return false;
  const canvas = stage.querySelector("canvas.comical-generated") as HTMLCanvasElement | null;
  if (!canvas) return false;
  if (canvasMatchesStage(canvas, stage)) return false;

  applySpecs(comical, getTargets());
  stopComicalEditing(comical);
  releaseEditingStage(stage);
  comical.Comical.startEditing([stage]);
  claimEditingStage(stage);
  comical.Comical.hideHandles();
  return true;
}

export function useComicalBubbles(options: {
  active: boolean;
  stageRef: RefObject<HTMLElement | null>;
  /** Stable key so effects re-run when bubble config changes. */
  targetsKey: string;
  getTargets: () => ComicalBubbleTarget[];
}) {
  const { active, stageRef, targetsKey, getTargets } = options;
  const comicalRef = useRef<ComicalModule | null>(null);
  const editingRef = useRef(false);
  const generationRef = useRef(0);
  const getTargetsRef = useRef(getTargets);
  getTargetsRef.current = getTargets;

  const refreshBubbles = useCallback(() => {
    const stage = stageRef.current;
    const comical = comicalRef.current;
    if (!stage || !comical || !editingRef.current || !isClaimedEditingStage(stage)) return;
    try {
      const restarted = restartEditingIfCanvasStale(comical, stage, getTargetsRef.current);
      if (!restarted) {
        comical.Comical.update(stage);
        comical.Comical.hideHandles();
      }
    } catch {
      // stage may be mid-teardown
    }
  }, [stageRef]);

  useEffect(() => {
    if (!active) {
      generationRef.current += 1;
      const stage = stageRef.current;
      if (stage && isClaimedEditingStage(stage)) {
        stopComicalEditing(comicalRef.current);
        releaseEditingStage(stage);
      }
      editingRef.current = false;
      return;
    }

    const gen = ++generationRef.current;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let frameId = 0;

    const mount = async () => {
      const comical = await loadComical();
      if (cancelled || generationRef.current !== gen) return;

      comicalRef.current = comical;
      const stage = stageRef.current;
      if (!stage) return;

      applySpecs(comical, getTargetsRef.current());

      const prev = editingStageEl;
      stopComicalEditing(comical);
      if (prev && prev !== stage) releaseEditingStage(prev);
      comical.Comical.startEditing([stage]);
      claimEditingStage(stage);
      editingRef.current = true;
      comical.Comical.hideHandles();

      requestAnimationFrame(() => {
        if (cancelled || generationRef.current !== gen) return;
        if (!isClaimedEditingStage(stage)) return;
        applySpecs(comical, getTargetsRef.current());
        try {
          if (!restartEditingIfCanvasStale(comical, stage, getTargetsRef.current())) {
            comical.Comical.update(stage);
            comical.Comical.hideHandles();
          }
        } catch {
          // stage may no longer be the active Comical edit root
        }
      });

      resizeObserver = new ResizeObserver(() => {
        refreshBubbles();
      });
      resizeObserver.observe(stage);
      for (const target of getTargetsRef.current()) {
        if (target.element) resizeObserver.observe(target.element);
      }
    };

    frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void mount();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      generationRef.current += 1;
      const stage = stageRef.current;
      if (stage && isClaimedEditingStage(stage)) {
        stopComicalEditing(comicalRef.current);
        releaseEditingStage(stage);
      }
      editingRef.current = false;
    };
  }, [active, refreshBubbles, stageRef, targetsKey]);

  useEffect(() => {
    if (!active || !editingRef.current) return;
    const frameId = requestAnimationFrame(() => {
      syncSpecs(comicalRef.current, stageRef.current, editingRef.current, getTargetsRef.current);
    });
    return () => cancelAnimationFrame(frameId);
  }, [active, stageRef, targetsKey]);

  return { refreshBubbles };
}
