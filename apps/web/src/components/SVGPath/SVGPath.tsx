"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useScrollBlocking } from "@/hooks/useScrollBlocking";
import { SVGPathLantern } from "./SVGPathLantern";
import { useSvgPathInput } from "./useSvgPathInput";
import { useSvgPathScroll } from "./useSvgPathScroll";
import {
  isStopOnPath,
  lanternTransformAtStops,
  parseSplitPathSvg,
  splitPathSvgInnerMarkup,
  stopForHaikuIndex,
  SVG_PATH_FOCUS_STOP,
  type ParsedSplitPathSvg,
} from "./utils";
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
  const splitPath = useSplitPathSvg();
  const parsed = splitPath?.parsed ?? null;
  const stageRef = useRef<HTMLDivElement>(null);
  const svgAreaRef = useRef<HTMLDivElement>(null);
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
  useScrollBlocking(svgAreaRef);

  const visibleLanterns = useMemo(() => {
    if (!parsed) return [];

    return haikus.flatMap((haiku, haikuIndex) => {
      const fromStop = stopForHaikuIndex(haikuIndex, fromFocusIndex);
      const toStop = stopForHaikuIndex(haikuIndex, focusIndex);
      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];

      const transform = lanternTransformAtStops(parsed, fromStop, toStop, tweenProgress);
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
