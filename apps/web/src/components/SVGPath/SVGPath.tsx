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
import { SVGPathLantern } from "./SVGPathLantern";
import { useSvgPathInput } from "./useSvgPathInput";
import { useSvgPathScroll } from "./useSvgPathScroll";
import {
  catchUpStopForHaiku,
  creationFlyProgress,
  creationLanternTransformAtFlyT,
  CREATION_FOCUS_INDEX,
  isStopOnPath,
  lanternTransformAtStops,
  parseSplitPathSvg,
  shouldFetchNextQueuePage,
  splitPathSvgInnerMarkup,
  stopForHaikuIndex,
  SVG_PATH_FOCUS_STOP,
  type ParsedSplitPathSvg,
} from "./utils";
import { CreationPathLantern } from "./CreationPathLantern";
import { CREATION_ENTER_MS } from "./consts/creationPathLanternConsts";
import styles from "./SVGPath.module.css";

const SVG_PATH_SRC = "/path/split_path_colored_stops.svg";
/** Adjacent focus steps tween continuously along the path (matches TweenedStops story). */
const SVG_PATH_STEP_MS = 300;
const SVG_PATH_CATCH_UP_MS = 450;
const SVG_PATH_DELETE_PACK_MS = 450;
/** Start neighbor pack when exit flight first holds this pose (0-based; 3 = 4th frame). */
const DELETE_PACK_CUE_POSE_INDEX = 3;

type CreationLayerState = {
  requestId: string;
  draft: GeneratingDraft | null;
  /** Far-path: keep showing saved haiku under modal chrome after stream ends. */
  handoffHaiku: HaikuDto | null;
  /** Kept at 1 while mounted; overlay unmounts instantly on near-path handoff. */
  overlayOpacity: number;
};

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
  /**
   * Far-path CreationModal chrome is open — park creation lantern on guideBox stop-20
   * (do not render a second lantern in the modal).
   */
  creationChromeOpen?: boolean;
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
    creationChromeOpen = false,
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
  const [creationLayer, setCreationLayer] = useState<CreationLayerState | null>(null);
  const newestAtCreationStartRef = useRef<string | null>(null);
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
    creationSlotDurationMs: CREATION_ENTER_MS,
  });

  // Keep absolute creation overlay mounted across draft updates; near vs far handoff differ.
  useLayoutEffect(() => {
    if (!generatingDraft) return;
    setCreationLayer((prev) => {
      if (prev?.requestId === generatingDraft.requestId) {
        return { ...prev, draft: generatingDraft, handoffHaiku: null };
      }
      newestAtCreationStartRef.current = haikusRef.current[0]?.id ?? null;
      return {
        requestId: generatingDraft.requestId,
        draft: generatingDraft,
        handoffHaiku: null,
        overlayOpacity: 1,
      };
    });
  }, [generatingDraft]);

  useLayoutEffect(() => {
    if (generatingDraft) return;
    setCreationLayer((prev) => {
      if (!prev?.draft) return prev;
      const newest = haikus[0];
      if (!newest || newest.id === newestAtCreationStartRef.current) {
        return creationChromeOpen ? prev : null;
      }

      if (focusIndex === 0) {
        // Near path: list lantern owns stop-20; drop overlay (no crossfade flicker).
        return null;
      }

      // Far path: keep path lantern under modal chrome until chrome closes.
      return {
        ...prev,
        draft: null,
        handoffHaiku: newest,
        overlayOpacity: 1,
      };
    });
  }, [generatingDraft, haikus, focusIndex, creationChromeOpen]);

  // Drop far-path overlay when modal chrome closes.
  useLayoutEffect(() => {
    if (creationChromeOpen || generatingDraft) return;
    setCreationLayer((prev) => {
      if (!prev) return prev;
      if (prev.draft) return prev;
      return null;
    });
  }, [creationChromeOpen, generatingDraft]);

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

  const visibleLanterns = useMemo(() => {
    if (!parsed) return [];

    const catchUpStart = catchUpStartRef.current;
    const catchingUp = catchUpStart !== null && displayCatchUpT < 1;
    const packing = packingActive;

    type VisibleLantern = {
      haiku?: HaikuDto;
      haikuIndex: number;
      loading: boolean;
      transform: NonNullable<ReturnType<typeof lanternTransformAtStops>>;
      face: StopFace;
    };

    const lanterns: VisibleLantern[] = haikus.flatMap((haiku, haikuIndex) => {
      let fromStop = stopForHaikuIndex(haikuIndex, fromFocusIndex);
      let toStop = stopForHaikuIndex(haikuIndex, focusIndex);
      let localT = tweenProgress;

      if (catchingUp && haikuIndex >= catchUpStart) {
        fromStop = catchUpStopForHaiku(haikuIndex, catchUpStart, fromFocusIndex, displayCatchUpT);
        toStop = catchUpStopForHaiku(haikuIndex, catchUpStart, focusIndex, displayCatchUpT);
      } else if (packing) {
        const prevIndex = deletePack.prevIndexById.get(haiku.id);
        if (prevIndex != null && prevIndex !== haikuIndex) {
          // Tween along path from vacated older slot toward compacted slot.
          fromStop = stopForHaikuIndex(prevIndex, focusIndex);
          toStop = stopForHaikuIndex(haikuIndex, focusIndex);
          localT = deletePackT;
        }
      }

      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];

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

    return lanterns;
  }, [
    deletePack,
    deletePackT,
    displayCatchUpT,
    focusIndex,
    fromFocusIndex,
    haikus,
    loaderShown,
    packingActive,
    parsed,
    tweenProgress,
  ]);

  // Near: fly tracks list scroll-back tween. Far chrome: park on stop-20 in guideBox.
  const scrollGate = creationLayer
    ? creationFlyProgress(focusIndex, fromFocusIndex, tweenProgress, isAnimating)
    : null;
  const farPark =
    Boolean(creationLayer) &&
    creationChromeOpen &&
    focusIndex !== CREATION_FOCUS_INDEX &&
    !isAnimating &&
    scrollGate === null;
  const creationFlyT = farPark ? 1 : scrollGate;

  const creationTransform =
    parsed && creationFlyT !== null
      ? creationLanternTransformAtFlyT(parsed, creationFlyT)
      : null;

  const creationOverlayOpacity = creationLayer?.overlayOpacity ?? 0;
  /** Far path: hide the list lantern that would sit under the creation overlay at stop-20. */
  const hideListFocusStop =
    creationFlyT !== null && creationTransform != null && farPark;

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
            .map(({ haiku, haikuIndex, loading, transform, face }) => {
              // Far-path: creation overlay owns stop-20; hide the list lantern underneath.
              if (
                hideListFocusStop &&
                stopForHaikuIndex(haikuIndex, focusIndex) === SVG_PATH_FOCUS_STOP
              ) {
                return null;
              }
              const key = loading
                ? "pagination-loader"
                : (haiku?.id ?? `svg-path-${haikuIndex}`);
              const onDeleted = haiku
                ? (deleted: HaikuDto) => handleLanternDeleted(deleted, transform)
                : undefined;
              const packing = deletePack != null && deletePackT < 1;

              return (
                <SVGPathLantern
                  key={key}
                  haiku={haiku}
                  loading={loading}
                  transform={transform}
                  face={face}
                  isAnimating={isAnimating || packing}
                  suppressReveal
                  actionsAlwaysVisible={haikuIndex === focusIndex}
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
          {creationTransform && creationLayer ? (
            <CreationPathLantern
              transform={creationTransform}
              overlayOpacity={creationOverlayOpacity}
              generatingDraft={creationLayer.draft}
              handoffHaiku={creationLayer.handoffHaiku}
              excludeLabelIds={excludeLabelIds}
              elevateAboveChrome={creationChromeOpen}
              guideBoxRef={svgAreaRef}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
});
