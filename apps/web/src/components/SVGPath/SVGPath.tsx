"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { prefersReducedMotion } from "@/components/Lantern/simulateFlight";
import { useScrollBlocking } from "@/hooks/useScrollBlocking";
import { ExitingPathLantern } from "./ExitingPathLantern";
import {
  rotationFaceAtProgress,
  targetFaceForStop,
  targetRotationForStop,
  type StopFace,
} from "./pathStopRotation";
import {
  buildPathStopStepPoses,
  PATH_STOP_STEP_TOTAL_MS,
  pathStepPoseToTransform,
  type PathStepPose,
} from "./pathStopSteppedMotion";
import { SVGPathLantern } from "./SVGPathLantern";
import { SVGPathSteppedLantern } from "./SVGPathSteppedLantern";
import { useSvgPathInput } from "./useSvgPathInput";
import { useSvgPathScroll } from "./useSvgPathScroll";
import {
  catchUpStopForHaiku,
  creationFlyProgress,
  generatingLanternTransformAtFlyT,
  isStopOnPath,
  lanternTransformAtStops,
  parseSplitPathSvg,
  shouldFetchNextQueuePage,
  splitPathSvgInnerMarkup,
  stopForHaikuIndex,
  type ParsedSplitPathSvg,
} from "./utils";
import styles from "./SVGPath.module.css";

const SVG_PATH_SRC = "/path/split_path_colored_stops.svg";
/** Adjacent focus steps use SteppedTransition (matches SteppedStops story). */
const SVG_PATH_STEP_MS = PATH_STOP_STEP_TOTAL_MS;
const SVG_PATH_CATCH_UP_MS = 450;
const SVG_PATH_DELETE_PACK_MS = 450;
/** Start neighbor pack when exit flight first holds this pose (0-based; 3 = 4th frame). */
const DELETE_PACK_CUE_POSE_INDEX = 3;

function pathStepPoseAsTransform(pose: PathStepPose): LanternTransform {
  return pathStepPoseToTransform(pose, 1);
}

type ExitingLantern = {
  haiku: HaikuDto;
  transform: LanternTransform;
};

/** Snapshot used to tween lanterns from pre-delete indices to compacted indices. */
type DeletePack = {
  /** haikuId → index before deletion */
  prevIndexById: Map<string, number>;
};

export type SVGPathHandle = {
  scrollToTop: () => boolean;
  scrollToCreationSlot: () => boolean;
  /** Instantly set focus to 0 (no scroll animation). */
  snapToTop: () => boolean;
  getFocusIndex: () => number;
};

export type SVGPathProps = {
  haikus: HaikuDto[];
  generatingDraft?: GeneratingDraft | null;
  initialFocusIndex?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onVacantQueueSlot?: () => void;
  onFocusChange?: (focusIndex: number) => void;
  onHaikuDeleted?: (haiku: HaikuDto) => void;
  onHaikuDeleteFailed?: (haiku: HaikuDto) => void;
  onHaikuChanged?: () => void;
  /** Label ids to omit from lantern belts (e.g. active filters). */
  excludeLabelIds?: string[];
  className?: string;
  showGuides?: boolean;
};

function useSplitPathSvg() {
  const [splitPath, setSplitPath] = useState<{
    parsed: ParsedSplitPathSvg;
    guideInner: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(SVG_PATH_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${SVG_PATH_SRC}`);
        }
        return response.text();
      })
      .then((markup) => {
        if (!cancelled) {
          setSplitPath({
            parsed: parseSplitPathSvg(markup),
            guideInner: splitPathSvgInnerMarkup(markup),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return splitPath;
}

export const SVGPath = forwardRef<SVGPathHandle, SVGPathProps>(function SVGPath(
  {
    haikus,
    generatingDraft = null,
    initialFocusIndex,
    hasNextPage = false,
    isFetchingNextPage = false,
    onVacantQueueSlot,
    onFocusChange,
    onHaikuDeleted,
    onHaikuDeleteFailed,
    onHaikuChanged,
    excludeLabelIds,
    className,
    showGuides = false,
  },
  ref,
) {
  const splitPath = useSplitPathSvg();
  const parsed = splitPath?.parsed ?? null;
  const stageRef = useRef<HTMLDivElement>(null);
  const svgAreaRef = useRef<HTMLDivElement>(null);
  const onVacantQueueSlotRef = useRef(onVacantQueueSlot);
  onVacantQueueSlotRef.current = onVacantQueueSlot;
  const [exitingLanterns, setExitingLanterns] = useState<ExitingLantern[]>([]);
  const [deletePack, setDeletePack] = useState<DeletePack | null>(null);
  const [deletePackT, setDeletePackT] = useState(1);
  const deletePackAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const deletePackStartedRef = useRef(false);
  const haikusRef = useRef(haikus);
  haikusRef.current = haikus;

  const startDeletePackAnimation = useCallback(() => {
    if (deletePackStartedRef.current) return;
    deletePackStartedRef.current = true;
    deletePackAnimationRef.current?.stop();
    deletePackAnimationRef.current = animate(0, 1, {
      duration: SVG_PATH_DELETE_PACK_MS / 1000,
      ease: "easeOut",
      onUpdate: (value) => setDeletePackT(value),
      onComplete: () => {
        setDeletePack(null);
        setDeletePackT(1);
        deletePackAnimationRef.current = null;
      },
    });
  }, []);

  const handleLanternDeleted = useCallback(
    (haiku: HaikuDto, transform: LanternTransform) => {
      const prevIndexById = new Map(haikusRef.current.map((h, index) => [h.id, index]));
      setExitingLanterns((prev) =>
        prev.some((entry) => entry.haiku.id === haiku.id)
          ? prev
          : [...prev, { haiku, transform }],
      );
      setDeletePack({ prevIndexById });
      setDeletePackT(0);
      deletePackStartedRef.current = false;
      deletePackAnimationRef.current?.stop();
      deletePackAnimationRef.current = null;
      onHaikuDeleted?.(haiku);
      // Reduced-motion skips stepped flight cues — pack immediately.
      if (prefersReducedMotion()) {
        startDeletePackAnimation();
      }
    },
    [onHaikuDeleted, startDeletePackAnimation],
  );

  const handleExitPoseHold = useCallback(
    (poseIndex: number) => {
      if (poseIndex >= DELETE_PACK_CUE_POSE_INDEX) {
        startDeletePackAnimation();
      }
    },
    [startDeletePackAnimation],
  );

  const handleLanternExitComplete = useCallback((haiku: HaikuDto) => {
    // Safety: if the flyer finished before the pack cue, still pack neighbors.
    startDeletePackAnimation();
    setExitingLanterns((prev) => prev.filter((entry) => entry.haiku.id !== haiku.id));
  }, [startDeletePackAnimation]);

  useEffect(() => {
    return () => {
      deletePackAnimationRef.current?.stop();
    };
  }, []);

  const morePages = hasNextPage || isFetchingNextPage;
  const scrollCount = haikus.length + (morePages ? 1 : 0);

  const {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
    scrollToTop,
    scrollToCreationSlot,
    snapToTop,
    getFocusIndex,
  } = useSvgPathScroll(scrollCount, SVG_PATH_STEP_MS, {
    initialFocusIndex,
    onFocusChange,
  });

  useImperativeHandle(
    ref,
    () => ({
      scrollToTop,
      scrollToCreationSlot,
      snapToTop,
      getFocusIndex,
    }),
    [getFocusIndex, scrollToCreationSlot, scrollToTop, snapToTop],
  );

  const loaderShown = morePages && shouldFetchNextQueuePage(haikus.length, focusIndex);

  useSvgPathInput(stageRef, stepForward, stepBack);
  useScrollBlocking(svgAreaRef);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (!shouldFetchNextQueuePage(haikus.length, focusIndex)) return;
    onVacantQueueSlotRef.current?.();
  }, [focusIndex, haikus.length, hasNextPage, isFetchingNextPage]);

  const catchUpStartRef = useRef<number | null>(null);
  const prevHaikuCountRef = useRef(haikus.length);
  const loaderWasShownRef = useRef(false);
  const [catchUpT, setCatchUpT] = useState(1);
  const catchUpAnimationRef = useRef<ReturnType<typeof animate> | null>(null);

  const startedCatchUpThisRender =
    haikus.length > prevHaikuCountRef.current && loaderWasShownRef.current;
  if (startedCatchUpThisRender) {
    catchUpStartRef.current = prevHaikuCountRef.current;
  }
  const displayCatchUpT = startedCatchUpThisRender ? 0 : catchUpT;

  useLayoutEffect(() => {
    const prevCount = prevHaikuCountRef.current;
    const nextCount = haikus.length;
    const wasLoader = loaderWasShownRef.current;
    prevHaikuCountRef.current = nextCount;
    loaderWasShownRef.current = loaderShown;

    if (nextCount <= prevCount || !wasLoader) return;

    catchUpStartRef.current = prevCount;
    setCatchUpT(0);
    catchUpAnimationRef.current?.stop();
    catchUpAnimationRef.current = animate(0, 1, {
      duration: SVG_PATH_CATCH_UP_MS / 1000,
      ease: "easeOut",
      onUpdate: (value) => setCatchUpT(value),
      onComplete: () => {
        catchUpStartRef.current = null;
        catchUpAnimationRef.current = null;
        setCatchUpT(1);
      },
    });
  }, [haikus.length, loaderShown]);

  useEffect(() => {
    return () => {
      catchUpAnimationRef.current?.stop();
    };
  }, []);

  const packingActive = deletePack != null && deletePackT < 1;
  const adjacentFocusStep =
    isAnimating && Math.abs(focusIndex - fromFocusIndex) === 1 && !packingActive;

  const visibleLanterns = useMemo(() => {
    if (!parsed) return [];

    const catchUpStart = catchUpStartRef.current;
    const catchingUp = catchUpStart !== null && displayCatchUpT < 1;
    const packing = packingActive;
    const stepRunKey = fromFocusIndex * 1_000_003 + focusIndex;

    type VisibleLantern = {
      haiku?: HaikuDto;
      haikuIndex: number;
      loading: boolean;
      transform: NonNullable<ReturnType<typeof lanternTransformAtStops>>;
      face: StopFace;
      poses?: PathStepPose[];
      stepRunKey?: number;
    };

    const lanterns: VisibleLantern[] = haikus.flatMap((haiku, haikuIndex) => {
      let fromStop = stopForHaikuIndex(haikuIndex, fromFocusIndex);
      let toStop = stopForHaikuIndex(haikuIndex, focusIndex);
      let localT = tweenProgress;
      let useStepped = adjacentFocusStep;

      if (catchingUp && haikuIndex >= catchUpStart) {
        fromStop = catchUpStopForHaiku(haikuIndex, catchUpStart, fromFocusIndex, displayCatchUpT);
        toStop = catchUpStopForHaiku(haikuIndex, catchUpStart, focusIndex, displayCatchUpT);
        useStepped = false;
      } else if (packing) {
        const prevIndex = deletePack.prevIndexById.get(haiku.id);
        if (prevIndex != null && prevIndex !== haikuIndex) {
          // Tween along path from vacated older slot toward compacted slot.
          fromStop = stopForHaikuIndex(prevIndex, focusIndex);
          toStop = stopForHaikuIndex(haikuIndex, focusIndex);
          localT = deletePackT;
          useStepped = false;
        }
      }

      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];

      if (useStepped) {
        const poses = buildPathStopStepPoses(parsed, fromStop, toStop);
        if (poses.length === 0) return [];
        const last = poses[poses.length - 1]!;
        return [
          {
            haiku,
            haikuIndex,
            loading: false,
            transform: pathStepPoseAsTransform(last),
            face: last.face,
            poses,
            stepRunKey,
          },
        ];
      }

      const transform = lanternTransformAtStops(parsed, fromStop, toStop, localT);
      if (!transform) return [];

      const face =
        fromStop === toStop || localT >= 1
          ? targetFaceForStop(parsed, toStop)
          : rotationFaceAtProgress(
              targetRotationForStop(parsed, fromStop),
              targetRotationForStop(parsed, toStop),
              localT,
            );

      return [
        {
          haiku,
          haikuIndex,
          loading: false,
          transform,
          face,
        },
      ];
    });

    if (loaderShown) {
      const fromStop = stopForHaikuIndex(haikus.length, fromFocusIndex);
      const toStop = stopForHaikuIndex(haikus.length, focusIndex);
      if (isStopOnPath(fromStop) || isStopOnPath(toStop)) {
        if (adjacentFocusStep) {
          const poses = buildPathStopStepPoses(parsed, fromStop, toStop);
          if (poses.length > 0) {
            const last = poses[poses.length - 1]!;
            lanterns.push({
              haiku: undefined,
              haikuIndex: haikus.length,
              loading: true,
              transform: pathStepPoseAsTransform(last),
              face: last.face,
              poses,
              stepRunKey,
            });
          }
        } else {
          const transform = lanternTransformAtStops(parsed, fromStop, toStop, tweenProgress);
          if (transform) {
            const face =
              fromStop === toStop || tweenProgress >= 1
                ? targetFaceForStop(parsed, toStop)
                : rotationFaceAtProgress(
                    targetRotationForStop(parsed, fromStop),
                    targetRotationForStop(parsed, toStop),
                    tweenProgress,
                  );
            lanterns.push({
              haiku: undefined,
              haikuIndex: haikus.length,
              loading: true,
              transform,
              face,
            });
          }
        }
      }
    }

    return lanterns;
    // During adjacent stepped focus motion, ignore tweenProgress so SteppedTransition
    // poses stay referentially stable (avoids effect restart storms / max update depth).
  }, [
    adjacentFocusStep,
    deletePack,
    deletePackT,
    displayCatchUpT,
    focusIndex,
    fromFocusIndex,
    haikus,
    isAnimating,
    loaderShown,
    packingActive,
    parsed,
    adjacentFocusStep ? 0 : tweenProgress,
  ]);

  const generatingFlyT = generatingDraft
    ? creationFlyProgress(focusIndex, fromFocusIndex, tweenProgress, isAnimating)
    : null;

  const generatingTransform =
    parsed && generatingFlyT !== null
      ? generatingLanternTransformAtFlyT(parsed, generatingFlyT)
      : null;

  const viewportClass = [styles.viewport, className].filter(Boolean).join(" ");
  const exitingIds = useMemo(
    () => new Set(exitingLanterns.map((entry) => entry.haiku.id)),
    [exitingLanterns],
  );

  return (
    <div ref={stageRef} className={viewportClass}>
      <div className={styles.stage} aria-label="Lantern SVG path">
        <div ref={svgAreaRef} className={styles.guideBox}>
          {showGuides && splitPath ? (
            <svg
              className={styles.guide}
              viewBox={`0 0 ${splitPath.parsed.viewBox.width} ${splitPath.parsed.viewBox.height}`}
              preserveAspectRatio="none"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: splitPath.guideInner }}
            />
          ) : null}
          {visibleLanterns
            .filter(({ haiku }) => !haiku || !exitingIds.has(haiku.id))
            .map(({ haiku, haikuIndex, loading, transform, face, poses, stepRunKey }) => {
              const key = loading
                ? "pagination-loader"
                : (haiku?.id ?? `svg-path-${haikuIndex}`);
              const onDeleted = haiku
                ? (deleted: HaikuDto) => handleLanternDeleted(deleted, transform)
                : undefined;
              const packing = deletePack != null && deletePackT < 1;

              if (poses && stepRunKey != null) {
                return (
                  <SVGPathSteppedLantern
                    key={key}
                    haiku={haiku}
                    loading={loading}
                    poses={poses}
                    runKey={stepRunKey}
                    excludeLabelIds={excludeLabelIds}
                    onDeleted={onDeleted}
                    onDeleteFailed={onHaikuDeleteFailed}
                    onChanged={onHaikuChanged}
                  />
                );
              }

              return (
                <SVGPathLantern
                  key={key}
                  haiku={haiku}
                  loading={loading}
                  transform={transform}
                  face={face}
                  isAnimating={isAnimating || packing}
                  suppressReveal
                  excludeLabelIds={excludeLabelIds}
                  onDeleted={onDeleted}
                  onDeleteFailed={onHaikuDeleteFailed}
                  onChanged={onHaikuChanged}
                />
              );
            })}
          {exitingLanterns.map(({ haiku, transform }) => (
            <ExitingPathLantern
              key={`exiting-${haiku.id}`}
              haiku={haiku}
              transform={transform}
              excludeLabelIds={excludeLabelIds}
              onPoseHold={handleExitPoseHold}
              onComplete={handleLanternExitComplete}
            />
          ))}
          {generatingDraft && generatingTransform ? (
            <SVGPathLantern
              key={`generating-${generatingDraft.requestId}`}
              generatingDraft={generatingDraft}
              transform={generatingTransform}
              isAnimating={isAnimating}
              excludeLabelIds={excludeLabelIds}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
});
