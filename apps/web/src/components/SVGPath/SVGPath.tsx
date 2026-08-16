"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { parseSplitPathSvg, type ParsedSplitPathSvg } from "./parseSplitPathSvg";
import { SVGPathLantern } from "./SVGPathLantern";
import { pointBetweenStops } from "./svgPathPoint";
import {
  isStopOnPath,
  lerpPose,
  stopForHaikuIndex,
  SVG_PATH_FOCUS_STOP,
} from "./svgPathPose";
import { useSvgPathInput } from "./useSvgPathInput";
import { useSvgPathScroll } from "./useSvgPathScroll";
import styles from "./SVGPath.module.css";

const SVG_PATH_SRC = "/split_path_colored_stops.svg";
const SVG_PATH_STEP_MS = 300;

export type SVGPathProps = {
  haikus: HaikuDto[];
  generatingDraft?: GeneratingDraft | null;
  initialFocusIndex?: number;
  onFocusChange?: (focusIndex: number) => void;
  onHaikuDeleted?: () => void;
  onHaikuChanged?: () => void;
  className?: string;
  showGuides?: boolean;
};

function useSplitPathSvg() {
  const [parsed, setParsed] = useState<ParsedSplitPathSvg | null>(null);

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
        if (!cancelled) setParsed(parseSplitPathSvg(markup));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return parsed;
}

function lanternTransform(
  parsed: ParsedSplitPathSvg,
  fromStop: number,
  toStop: number,
  t: number,
): LanternTransform | null {
  const point = pointBetweenStops(parsed, fromStop, toStop, t);
  if (!point) return null;

  const pose = lerpPose(fromStop, toStop, t);
  const pathStop = fromStop + (toStop - fromStop) * t;

  return {
    x: point.x,
    y: point.y,
    scale: pose.scale,
    opacity: pose.opacity,
    rotate: 0,
    positionMode: "percent",
    stackOrder: Math.round(pathStop * 10),
  };
}

export function SVGPath({
  haikus,
  generatingDraft = null,
  initialFocusIndex,
  onFocusChange,
  onHaikuDeleted,
  onHaikuChanged,
  className,
  showGuides = false,
}: SVGPathProps) {
  const parsed = useSplitPathSvg();
  const stageRef = useRef<HTMLDivElement>(null);
  const {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
  } = useSvgPathScroll(haikus.length, SVG_PATH_STEP_MS, {
    initialFocusIndex,
    onFocusChange,
  });

  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
    body: JSON.stringify({
      sessionId: "a4f3b7",
      runId: "pre-fix",
      hypothesisId: "A-B",
      location: "SVGPath.tsx:render",
      message: "svgpath render",
      data: { haikuCount: haikus.length, focusIndex, isAnimating },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  useSvgPathInput(stageRef, stepForward, stepBack);

  const visibleLanterns = useMemo(() => {
    if (!parsed) return [];

    return haikus.flatMap((haiku, haikuIndex) => {
      const fromStop = stopForHaikuIndex(haikuIndex, fromFocusIndex);
      const toStop = stopForHaikuIndex(haikuIndex, focusIndex);
      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];

      const transform = lanternTransform(parsed, fromStop, toStop, tweenProgress);
      if (!transform) return [];

      return [
        {
          haiku,
          haikuIndex,
          transform,
        },
      ];
    });
  }, [focusIndex, fromFocusIndex, haikus, parsed, tweenProgress]);

  const generatingTransform = parsed
    ? lanternTransform(parsed, SVG_PATH_FOCUS_STOP, SVG_PATH_FOCUS_STOP, 1)
    : null;

  const viewportClass = [styles.viewport, className].filter(Boolean).join(" ");

  return (
    <div ref={stageRef} className={viewportClass}>
      <div className={styles.stage} aria-label="Lantern SVG path">
        <div className={styles.guideBox}>
          {showGuides ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.guide} src={SVG_PATH_SRC} alt="" draggable={false} decoding="async" />
          ) : null}
          {visibleLanterns.map(({ haiku, haikuIndex, transform }) => (
            <SVGPathLantern
              key={haiku.id ?? `svg-path-${haikuIndex}`}
              haiku={haiku}
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
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
