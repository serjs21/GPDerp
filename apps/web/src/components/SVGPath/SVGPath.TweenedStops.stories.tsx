"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { animate } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Button } from "@/components/StyledComponents";
import pathStyles from "@/components/SVGPath/SVGPath.module.css";
import {
  rotationFaceAtProgress,
  targetFaceForStop,
  targetRotationForStop,
  type StopFace,
} from "@/components/SVGPath/pathStopRotation";
import { useSvgPathScroll } from "@/components/SVGPath/useSvgPathScroll";
import {
  isStopOnPath,
  lanternTransformAtStops,
  parseSplitPathSvg,
  SPLIT_PATH_MAX_STOP,
  SPLIT_PATH_MIN_STOP,
  splitPathSvgInnerMarkup,
  stopForHaikuIndex,
  SVG_PATH_FOCUS_STOP,
  type ParsedSplitPathSvg,
} from "@/components/SVGPath/utils";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  WISDOM_FOREST_BODIES,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "@/components/Lantern/Lantern";
import lanternStyles from "@/components/Lantern/Lantern.module.css";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { LanternRotated } from "@/components/Lantern/LanternRotated";
import {
  lanternTransformToCssVars,
  type LanternTransform,
} from "@/components/Lantern/lanternTransform";
import demoStyles from "@/components/Lantern/LanternFlightExit.stories.module.css";

/** Match production SVGPath focus step duration. */
const SVG_PATH_STEP_MS = 300;
const LANTERN_COUNT = 12;
const SVG_PATH_SRC = "/path/split_path_colored_stops.svg";
const WIDTH_REM = 19;

const DEMO_HAIKUS: HaikuDto[] = Array.from({ length: LANTERN_COUNT }, (_, i) =>
  makeMockHaiku({
    id: `tweened-stop-demo-${i}`,
    title: `Lantern ${i + 1}`,
    body: WISDOM_FOREST_BODIES[i % WISDOM_FOREST_BODIES.length] ?? EXAMPLE_HAIKU_BODY,
    createdAt: STORY_CREATED_AT,
  }),
);

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

function PathStopLanternView({
  haiku,
  transform,
  face,
  animating = false,
}: {
  haiku: HaikuDto;
  transform: LanternTransform;
  face: StopFace;
  animating?: boolean;
}) {
  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) return null;

  if (face.kind === "upright") {
    return (
      <LanternFrame
        className={[pathStyles.lantern, animating ? pathStyles.lanternAnimating : null]
          .filter(Boolean)
          .join(" ")}
        ariaLabel={`Haiku lantern: ${haiku.title}`}
        widthRem={WIDTH_REM}
        transform={transform}
        haikuLabels={haiku.labels}
        flightExiting={animating}
      >
        <Lantern haiku={haiku} showActions={false} />
      </LanternFrame>
    );
  }

  const anchorStyle = {
    ...lanternTransformToCssVars(transform),
    "--lantern-width": `${WIDTH_REM}rem`,
    animation: "none",
  } as CSSProperties;

  return (
    <div
      className={[
        lanternStyles.root,
        lanternStyles.pathPositioned,
        pathStyles.lantern,
        animating ? pathStyles.lanternAnimating : null,
        animating ? lanternStyles.flightExiting : null,
      ]
        .filter(Boolean)
        .join(" ")}
      style={anchorStyle}
      aria-label={`Haiku lantern: ${haiku.title}`}
    >
      <LanternRotated
        haiku={haiku}
        variant={face.variant}
        mirrored={face.mirrored}
        showActions={false}
        widthRem={WIDTH_REM}
        style={{ width: "100%", height: "100%", animation: "none" }}
      />
    </div>
  );
}

function faceForStopTween(
  parsed: ParsedSplitPathSvg,
  fromStop: number,
  toStop: number,
  t: number,
): StopFace {
  return rotationFaceAtProgress(
    targetRotationForStop(parsed, fromStop),
    targetRotationForStop(parsed, toStop),
    t,
  );
}

/** One lantern walks authored path stops with continuous spatial tween. */
function SingleLanternTweenDemo({ haiku }: { haiku: HaikuDto }) {
  const splitPath = useSplitPathSvg();
  const parsed = splitPath?.parsed ?? null;
  const [pathStop, setPathStop] = useState(SVG_PATH_FOCUS_STOP);
  const [fromStop, setFromStop] = useState(SVG_PATH_FOCUS_STOP);
  const [toStop, setToStop] = useState(SVG_PATH_FOCUS_STOP);
  const [tweenProgress, setTweenProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    return () => {
      animRef.current?.stop();
    };
  }, []);

  const beginStep = useCallback(
    (to: number) => {
      if (!parsed || isAnimating) return;
      const from = pathStop;
      if (to === from || !isStopOnPath(to)) return;
      if (!lanternTransformAtStops(parsed, from, to, 0)) {
        setPathStop(to);
        return;
      }

      genRef.current += 1;
      const gen = genRef.current;
      setFromStop(from);
      setToStop(to);
      setTweenProgress(0);
      setIsAnimating(true);

      animRef.current = animate(0, 1, {
        duration: SVG_PATH_STEP_MS / 1000,
        ease: "linear",
        onUpdate: (value) => {
          if (genRef.current !== gen) return;
          setTweenProgress(value);
        },
        onComplete: () => {
          if (genRef.current !== gen) return;
          setPathStop(to);
          setFromStop(to);
          setToStop(to);
          setTweenProgress(1);
          setIsAnimating(false);
          animRef.current = null;
        },
      });
    },
    [isAnimating, parsed, pathStop],
  );

  const onStepForward = useCallback(() => {
    if (pathStop >= SPLIT_PATH_MAX_STOP) return;
    beginStep(pathStop + 1);
  }, [beginStep, pathStop]);

  const onStepBack = useCallback(() => {
    if (pathStop <= SPLIT_PATH_MIN_STOP) return;
    beginStep(pathStop - 1);
  }, [beginStep, pathStop]);

  const lantern = useMemo(() => {
    if (!parsed) return null;
    const from = isAnimating ? fromStop : pathStop;
    const to = isAnimating ? toStop : pathStop;
    const t = isAnimating ? tweenProgress : 1;
    const transform = lanternTransformAtStops(parsed, from, to, t);
    if (!transform) return null;
    return {
      transform,
      face: isAnimating
        ? faceForStopTween(parsed, from, to, t)
        : targetFaceForStop(parsed, pathStop),
    };
  }, [fromStop, isAnimating, parsed, pathStop, toStop, tweenProgress]);

  return (
    <div className={demoStyles.demo}>
      <div className={demoStyles.toolbar}>
        <Button
          type="default"
          onClick={onStepBack}
          disabled={isAnimating || pathStop <= SPLIT_PATH_MIN_STOP}
        >
          Step back
        </Button>
        <Button
          type="primary"
          onClick={onStepForward}
          disabled={isAnimating || pathStop >= SPLIT_PATH_MAX_STOP}
        >
          Step forward
        </Button>
        <p className={demoStyles.readout}>
          stop {pathStop}
          {isAnimating ? ` · tweening ${fromStop}→${toStop}` : " · idle"} · 1 lantern · path tween{" "}
          {SVG_PATH_STEP_MS}ms
        </p>
      </div>
      <div className={pathStyles.viewport}>
        <div className={pathStyles.stage} aria-label="Tweened path stop demo">
          <div className={pathStyles.guideBox}>
            {splitPath ? (
              <svg
                className={pathStyles.guide}
                viewBox={`0 0 ${splitPath.parsed.viewBox.width} ${splitPath.parsed.viewBox.height}`}
                preserveAspectRatio="none"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: splitPath.guideInner }}
              />
            ) : null}
            {lantern ? (
              <PathStopLanternView
                haiku={haiku}
                transform={lantern.transform}
                face={lantern.face}
                animating={isAnimating}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Multi-lantern focus pack with continuous spatial tween (production path step). */
function MultiLanternTweenDemo({ haikus }: { haikus: HaikuDto[] }) {
  const splitPath = useSplitPathSvg();
  const parsed = splitPath?.parsed ?? null;
  const {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
    canStepForward,
    canStepBack,
  } = useSvgPathScroll(haikus.length, SVG_PATH_STEP_MS);

  const lanterns = useMemo(() => {
    if (!parsed) return [];
    return haikus.flatMap((haiku, haikuIndex) => {
      const fromStop = stopForHaikuIndex(haikuIndex, fromFocusIndex);
      const toStop = stopForHaikuIndex(haikuIndex, focusIndex);
      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];
      const t = isAnimating ? tweenProgress : 1;
      const transform = lanternTransformAtStops(parsed, fromStop, toStop, t);
      if (!transform) return [];
      const face = isAnimating
        ? faceForStopTween(parsed, fromStop, toStop, t)
        : targetFaceForStop(parsed, toStop);
      return [{ haiku, transform, face }];
    });
  }, [focusIndex, fromFocusIndex, haikus, isAnimating, parsed, tweenProgress]);

  return (
    <div className={demoStyles.demo}>
      <div className={demoStyles.toolbar}>
        <Button type="default" onClick={stepBack} disabled={!canStepBack}>
          Step back
        </Button>
        <Button type="primary" onClick={stepForward} disabled={!canStepForward}>
          Step forward
        </Button>
        <p className={demoStyles.readout}>
          focus {focusIndex}
          {isAnimating ? ` · tweening ${fromFocusIndex}→${focusIndex}` : " · idle"} ·{" "}
          {haikus.length} lanterns · path tween {SVG_PATH_STEP_MS}ms
        </p>
      </div>
      <div className={pathStyles.viewport}>
        <div className={pathStyles.stage} aria-label="Tweened path focus demo">
          <div className={pathStyles.guideBox}>
            {splitPath ? (
              <svg
                className={pathStyles.guide}
                viewBox={`0 0 ${splitPath.parsed.viewBox.width} ${splitPath.parsed.viewBox.height}`}
                preserveAspectRatio="none"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: splitPath.guideInner }}
              />
            ) : null}
            {lanterns.map(({ haiku, transform, face }) => (
              <PathStopLanternView
                key={haiku.id}
                haiku={haiku}
                transform={transform}
                face={face}
                animating={isAnimating}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SINGLE_HAIKU = DEMO_HAIKUS[0]!;

const meta: Meta = {
  title: "Haiku/SVGPath/Tweened stops",
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};

export default meta;

export const SingleLantern: StoryObj = {
  name: "Single lantern",
  render: () => <SingleLanternTweenDemo haiku={SINGLE_HAIKU} />,
};

export const StepAlongPath: StoryObj = {
  name: "Step along path",
  render: () => <MultiLanternTweenDemo haikus={DEMO_HAIKUS} />,
};
