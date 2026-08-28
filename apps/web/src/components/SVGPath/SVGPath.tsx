"use client";

import {
  forwardRef,
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
import { useScrollBlocking } from "@/hooks/useScrollBlocking";
import { SVGPathLantern } from "./SVGPathLantern";
import { useSvgPathInput } from "./useSvgPathInput";
import { useSvgPathScroll } from "./useSvgPathScroll";
import {
  catchUpStopForHaiku,
  isStopOnPath,
  lanternTransformAtStops,
  parseSplitPathSvg,
  shouldFetchNextQueuePage,
  splitPathSvgInnerMarkup,
  stopForHaikuIndex,
  SVG_PATH_FOCUS_STOP,
  type ParsedSplitPathSvg,
} from "./utils";
import styles from "./SVGPath.module.css";

const SVG_PATH_SRC = "/split_path_colored_stops.svg";
const SVG_PATH_STEP_MS = 300;
const SVG_PATH_CATCH_UP_MS = 450;

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
  onHaikuDeleted?: () => void;
  onHaikuChanged?: () => void;
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
    onHaikuChanged,
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

  const visibleLanterns = useMemo(() => {
    if (!parsed) return [];

    const catchUpStart = catchUpStartRef.current;
    const catchingUp = catchUpStart !== null && displayCatchUpT < 1;

    const lanterns: {
      haiku?: HaikuDto;
      haikuIndex: number;
      loading: boolean;
      transform: NonNullable<ReturnType<typeof lanternTransformAtStops>>;
    }[] = haikus.flatMap((haiku, haikuIndex) => {
      let fromStop = stopForHaikuIndex(haikuIndex, fromFocusIndex);
      let toStop = stopForHaikuIndex(haikuIndex, focusIndex);

      if (catchingUp && haikuIndex >= catchUpStart) {
        fromStop = catchUpStopForHaiku(haikuIndex, catchUpStart, fromFocusIndex, displayCatchUpT);
        toStop = catchUpStopForHaiku(haikuIndex, catchUpStart, focusIndex, displayCatchUpT);
      }

      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];

      const transform = lanternTransformAtStops(parsed, fromStop, toStop, tweenProgress);
      if (!transform) return [];

      return [
        {
          haiku,
          haikuIndex,
          loading: false,
          transform,
        },
      ];
    });

    if (loaderShown) {
      const fromStop = stopForHaikuIndex(haikus.length, fromFocusIndex);
      const toStop = stopForHaikuIndex(haikus.length, focusIndex);
      if (isStopOnPath(fromStop) || isStopOnPath(toStop)) {
        const transform = lanternTransformAtStops(parsed, fromStop, toStop, tweenProgress);
        if (transform) {
          lanterns.push({
            haiku: undefined,
            haikuIndex: haikus.length,
            loading: true,
            transform,
          });
        }
      }
    }

    return lanterns;
  }, [
    displayCatchUpT,
    focusIndex,
    fromFocusIndex,
    haikus,
    loaderShown,
    parsed,
    tweenProgress,
  ]);

  const generatingTransform = parsed
    ? lanternTransformAtStops(parsed, SVG_PATH_FOCUS_STOP, SVG_PATH_FOCUS_STOP, 1)
    : null;

  const viewportClass = [styles.viewport, className].filter(Boolean).join(" ");

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
          {visibleLanterns.map(({ haiku, haikuIndex, loading, transform }) => (
            <SVGPathLantern
              key={loading ? "pagination-loader" : (haiku?.id ?? `svg-path-${haikuIndex}`)}
              haiku={haiku}
              loading={loading}
              transform={transform}
              isAnimating={isAnimating}
              onDeleted={onHaikuDeleted}
              onChanged={onHaikuChanged}
            />
          ))}
          {generatingDraft && generatingTransform ? (
            <SVGPathLantern
              key={`generating-${generatingDraft.requestId}`}
              generatingDraft={generatingDraft}
              transform={generatingTransform}
              flyIn
            />
          ) : null}
        </div>
      </div>
    </div>
  );
});
