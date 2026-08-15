"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
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

  const focusHaiku = haikus[focusIndex];
  const hudLabel = focusHaiku
    ? `${focusHaiku.title || "Haiku"} · stop-${SVG_PATH_FOCUS_STOP} · ${focusIndex + 1} / ${haikus.length}`
    : "No haikus";

  const viewportClass = [styles.viewport, className].filter(Boolean).join(" ");

  return (
    <div ref={stageRef} className={viewportClass}>
      <p className={styles.hud}>{hudLabel}</p>
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
        </div>
      </div>
    </div>
  );
}
