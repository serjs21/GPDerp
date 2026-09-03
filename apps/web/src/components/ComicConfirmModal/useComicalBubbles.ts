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
  stage.setAttribute("data-comical-editing", "1");
}

function releaseEditingStage(stage: HTMLElement | null) {
  if (stage) {
    stage.removeAttribute("data-comical-editing");
    if (editingStageEl === stage) editingStageEl = null;
    return;
  }
  editingStageEl?.removeAttribute("data-comical-editing");
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

      const targets = getTargetsRef.current();
      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix",
          hypothesisId: "A",
          location: "useComicalBubbles.ts:mount",
          message: "startEditing about to run",
          data: {
            gen,
            targetsKey,
            editingStagesBefore: document.querySelectorAll("[data-comical-editing]").length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      applySpecs(comical, targets);

      const prev = editingStageEl;
      stopComicalEditing(comical);
      if (prev && prev !== stage) releaseEditingStage(prev);
      comical.Comical.startEditing([stage]);
      claimEditingStage(stage);
      editingRef.current = true;
      comical.Comical.hideHandles();

      requestAnimationFrame(() => {
        if (cancelled || generationRef.current !== gen) {
          // #region agent log
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
            body: JSON.stringify({
              sessionId: "53a752",
              runId: "post-fix",
              hypothesisId: "B",
              location: "useComicalBubbles.ts:rAF",
              message: "rAF skipped due to cancel/gen",
              data: { gen, targetsKey },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          return;
        }
        if (!isClaimedEditingStage(stage)) {
          // #region agent log
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
            body: JSON.stringify({
              sessionId: "53a752",
              runId: "post-fix",
              hypothesisId: "A",
              location: "useComicalBubbles.ts:rAF",
              message: "update skipped — not owner stage",
              data: { gen, targetsKey },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          return;
        }
        applySpecs(comical, getTargetsRef.current());
        try {
          if (!restartEditingIfCanvasStale(comical, stage, getTargetsRef.current())) {
            comical.Comical.update(stage);
            comical.Comical.hideHandles();
          }
          // #region agent log
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
            body: JSON.stringify({
              sessionId: "53a752",
              runId: "post-fix",
              hypothesisId: "A",
              location: "useComicalBubbles.ts:rAF",
              message: "update succeeded as owner",
              data: {
                gen,
                targetsKey,
                editingStages: document.querySelectorAll("[data-comical-editing]").length,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          // #region agent log
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
            body: JSON.stringify({
              sessionId: "53a752",
              runId: "post-fix",
              hypothesisId: "A",
              location: "useComicalBubbles.ts:rAF",
              message: "update threw",
              data: { gen, targetsKey, errMessage: err.message },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        }
      });

      resizeObserver = new ResizeObserver(() => {
        // #region agent log
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
          body: JSON.stringify({
            sessionId: "53a752",
            runId: "post-fix",
            hypothesisId: "D",
            location: "useComicalBubbles.ts:resize",
            message: "ResizeObserver refreshBubbles",
            data: {
              targetsKey,
              isOwner: isClaimedEditingStage(stage),
              editing: editingRef.current,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
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
      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix",
          hypothesisId: "B",
          location: "useComicalBubbles.ts:cleanup",
          message: "effect cleanup stopEditing",
          data: {
            targetsKey,
            wasOwner: Boolean(stage && isClaimedEditingStage(stage)),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
