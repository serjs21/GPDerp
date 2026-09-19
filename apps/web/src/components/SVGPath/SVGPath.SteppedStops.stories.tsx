"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HaikuDto } from "@/api/haikus";
import {
  sampleSteppedProgresses,
  SteppedTransition,
  type TransitionPose,
} from "@/components/animations/SteppedTransition";
import { Button } from "@/components/StyledComponents";
import pathStyles from "@/components/SVGPath/SVGPath.module.css";
import {
  canStepBack,
  canStepForward,
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
import {
  rotationFaceForPose,
  targetFaceForStop,
  targetRotationForStop,
  type StopFace,
} from "@/components/SVGPath/pathStopRotation";

const LANTERN_COUNT = 12;
const SVG_PATH_SRC = "/path/split_path_colored_stops.svg";
const WIDTH_REM = 19;
/** Discrete holds from one path stop to the next. */
const STOP_STEP_POSE_COUNT = 5;
/** Total stop→stop duration spent on discrete holds (hard cuts, no fade). */
const STOP_STEP_TOTAL_MS = 1000;
const STOP_STEP_INTERVALS = STOP_STEP_POSE_COUNT - 1;
const STOP_STEP_HOLD_MS = Math.round(STOP_STEP_TOTAL_MS / STOP_STEP_INTERVALS);
/** No opacity fade between poses — stop-motion hard cuts (reveal CSS disabled while animating). */
const STOP_STEP_CROSSFADE_MS = 0;

const DEMO_HAIKUS: HaikuDto[] = Array.from({ length: LANTERN_COUNT }, (_, i) =>
  makeMockHaiku({
    id: `stepped-stop-demo-${i}`,
    title: `Lantern ${i + 1}`,
    body: WISDOM_FOREST_BODIES[i % WISDOM_FOREST_BODIES.length] ?? EXAMPLE_HAIKU_BODY,
    createdAt: STORY_CREATED_AT,
  }),
);

type FocusStep = {
  from: number;
  to: number;
  runKey: number;
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

type PathStepPose = TransitionPose & {
  /** Same as SVGPath: `Math.round(pathStop * 10)` — higher stop (closer to focus) paints on top. */
  stackOrder: number;
  pathStop: number;
  face: StopFace;
};

/** Discrete path poses between two authored stops (no live spatial tween). */
function buildPathStopStepPoses(
  parsed: ParsedSplitPathSvg,
  fromStop: number,
  toStop: number,
): PathStepPose[] {
  const progresses = sampleSteppedProgresses(STOP_STEP_POSE_COUNT, false);
  const startRotation = targetRotationForStop(parsed, fromStop);
  const endRotation = targetRotationForStop(parsed, toStop);
  const poses: PathStepPose[] = [];
  progresses.forEach((progress, poseIndex) => {
    const transform = lanternTransformAtStops(parsed, fromStop, toStop, progress);
    if (!transform) return;
    const pathStop = fromStop + (toStop - fromStop) * progress;
    poses.push({
      progress,
      x: transform.x,
      y: transform.y,
      rotation: transform.rotate,
      scale: transform.scale,
      opacity: transform.opacity ?? 1,
      stackOrder: transform.stackOrder ?? Math.round(pathStop * 10),
      pathStop,
      face: rotationFaceForPose(
        startRotation,
        endRotation,
        poseIndex,
        STOP_STEP_POSE_COUNT,
      ),
    });
  });
  return poses;
}

function poseToLanternTransform(pose: PathStepPose, layerOpacity: number): LanternTransform {
  return {
    positionMode: "percent",
    x: pose.x,
    y: pose.y,
    scale: pose.scale ?? 1,
    rotate: pose.rotation,
    opacity: (pose.opacity ?? 1) * layerOpacity,
    stackOrder: pose.stackOrder,
  };
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
        flightExiting
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
        lanternStyles.flightExiting,
        animating ? pathStyles.lanternAnimating : null,
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

function SteppedPathLantern({
  haiku,
  poses,
  runKey,
  onComplete,
}: {
  haiku: HaikuDto;
  poses: PathStepPose[];
  runKey: number;
  onComplete: () => void;
}) {
  if (poses.length === 0) {
    return null;
  }

  if (poses.length === 1) {
    const pose = poses[0]!;
    return (
      <PathStopLanternView
        haiku={haiku}
        transform={poseToLanternTransform(pose, 1)}
        face={pose.face}
      />
    );
  }

  return (
    <SteppedTransition
      key={runKey}
      poses={poses}
      active
      holdMs={STOP_STEP_HOLD_MS}
      crossfadeMs={STOP_STEP_CROSSFADE_MS}
      onComplete={onComplete}
      renderPose={(pose, layerOpacity) => {
        const pathPose = pose as PathStepPose;
        return (
          <PathStopLanternView
            haiku={haiku}
            transform={poseToLanternTransform(pathPose, layerOpacity)}
            face={pathPose.face}
            animating
          />
        );
      }}
    />
  );
}

function SteppedStopsDemo({
  haikus,
  walkPathStops = false,
}: {
  haikus: HaikuDto[];
  /** One lantern walks authored path stops (simpler debugging). */
  walkPathStops?: boolean;
}) {
  const splitPath = useSplitPathSvg();
  const parsed = splitPath?.parsed ?? null;
  const [focusIndex, setFocusIndex] = useState(0);
  const [pathStop, setPathStop] = useState(SVG_PATH_FOCUS_STOP);
  const [step, setStep] = useState<FocusStep | null>(null);
  const pendingRef = useRef(0);

  const idleLanterns = useMemo(() => {
    if (!parsed || step) return [];
    if (walkPathStops) {
      const haiku = haikus[0];
      if (!haiku || !isStopOnPath(pathStop)) return [];
      const transform = lanternTransformAtStops(parsed, pathStop, pathStop, 1);
      if (!transform) return [];
      return [{ haiku, transform, face: targetFaceForStop(parsed, pathStop) }];
    }
    return haikus.flatMap((haiku, haikuIndex) => {
      const stop = stopForHaikuIndex(haikuIndex, focusIndex);
      if (!isStopOnPath(stop)) return [];
      const transform = lanternTransformAtStops(parsed, stop, stop, 1);
      if (!transform) return [];
      return [{ haiku, transform, face: targetFaceForStop(parsed, stop) }];
    });
  }, [focusIndex, haikus, parsed, pathStop, step, walkPathStops]);

  const steppingLanterns = useMemo(() => {
    if (!parsed || !step) return [];
    if (walkPathStops) {
      const haiku = haikus[0];
      if (!haiku) return [];
      const poses = buildPathStopStepPoses(parsed, step.from, step.to);
      if (poses.length === 0) return [];
      return [{ haiku, poses }];
    }
    return haikus.flatMap((haiku, haikuIndex) => {
      const fromStop = stopForHaikuIndex(haikuIndex, step.from);
      const toStop = stopForHaikuIndex(haikuIndex, step.to);
      if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return [];
      const poses = buildPathStopStepPoses(parsed, fromStop, toStop);
      if (poses.length === 0) return [];
      return [{ haiku, poses }];
    });
  }, [haikus, parsed, step, walkPathStops]);

  const finishStep = useCallback(() => {
    pendingRef.current -= 1;
    if (pendingRef.current > 0) return;
    setStep((current) => {
      if (current) {
        if (walkPathStops) setPathStop(current.to);
        else setFocusIndex(current.to);
      }
      return null;
    });
  }, [walkPathStops]);

  const beginPathStopStep = useCallback(
    (to: number) => {
      if (!parsed || step) return;
      const from = pathStop;
      if (to === from || !isStopOnPath(to)) return;
      const poses = buildPathStopStepPoses(parsed, from, to);
      if (poses.length === 0) {
        setPathStop(to);
        return;
      }
      pendingRef.current = 1;
      setStep({ from, to, runKey: Date.now() });
    },
    [parsed, pathStop, step],
  );

  const beginFocusStep = useCallback(
    (to: number) => {
      if (!parsed || step) return;
      const from = focusIndex;
      if (to === from) return;

      const movers = haikus.reduce((count, _, haikuIndex) => {
        const fromStop = stopForHaikuIndex(haikuIndex, from);
        const toStop = stopForHaikuIndex(haikuIndex, to);
        if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return count;
        const poses = buildPathStopStepPoses(parsed, fromStop, toStop);
        return poses.length > 0 ? count + 1 : count;
      }, 0);

      if (movers <= 0) {
        setFocusIndex(to);
        return;
      }

      pendingRef.current = movers;
      setStep({ from, to, runKey: Date.now() });
    },
    [focusIndex, haikus, parsed, step],
  );

  const onStepForward = useCallback(() => {
    if (walkPathStops) {
      if (pathStop >= SPLIT_PATH_MAX_STOP) return;
      beginPathStopStep(pathStop + 1);
      return;
    }
    if (!canStepForward(focusIndex, haikus.length)) return;
    beginFocusStep(focusIndex + 1);
  }, [beginFocusStep, beginPathStopStep, focusIndex, haikus.length, pathStop, walkPathStops]);

  const onStepBack = useCallback(() => {
    if (walkPathStops) {
      if (pathStop <= SPLIT_PATH_MIN_STOP) return;
      beginPathStopStep(pathStop - 1);
      return;
    }
    if (!canStepBack(focusIndex)) return;
    beginFocusStep(focusIndex - 1);
  }, [beginFocusStep, beginPathStopStep, focusIndex, pathStop, walkPathStops]);

  const animating = step != null;
  const canBack = walkPathStops ? pathStop > SPLIT_PATH_MIN_STOP : canStepBack(focusIndex);
  const canForward = walkPathStops
    ? pathStop < SPLIT_PATH_MAX_STOP
    : canStepForward(focusIndex, haikus.length);

  return (
    <div className={demoStyles.demo}>
      <div className={demoStyles.toolbar}>
        <Button type="default" onClick={onStepBack} disabled={animating || !canBack}>
          Step back
        </Button>
        <Button type="primary" onClick={onStepForward} disabled={animating || !canForward}>
          Step forward
        </Button>
        <p className={demoStyles.readout}>
          {walkPathStops ? `stop ${pathStop}` : `focus ${focusIndex}`}
          {step ? ` · stepping ${step.from}→${step.to}` : " · idle"} · {haikus.length} lantern
          {haikus.length === 1 ? "" : "s"} · SteppedTransition
        </p>
      </div>
      <div className={pathStyles.viewport}>
        <div className={pathStyles.stage} aria-label="Stepped path stop demo">
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
            {step
              ? steppingLanterns.map(({ haiku, poses }) => (
                  <SteppedPathLantern
                    key={haiku.id}
                    haiku={haiku}
                    poses={poses}
                    runKey={step.runKey}
                    onComplete={finishStep}
                  />
                ))
              : idleLanterns.map(({ haiku, transform, face }) => (
                  <PathStopLanternView
                    key={haiku.id}
                    haiku={haiku}
                    transform={transform}
                    face={face}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SINGLE_HAIKU = DEMO_HAIKUS.slice(0, 1);

const meta: Meta<typeof SteppedStopsDemo> = {
  title: "Haiku/SVGPath/Stepped stops",
  component: SteppedStopsDemo,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};

export default meta;
type Story = StoryObj<typeof SteppedStopsDemo>;

export const SingleLantern: Story = {
  name: "Single lantern",
  render: () => <SteppedStopsDemo haikus={SINGLE_HAIKU} walkPathStops />,
};

export const StepAlongPath: Story = {
  name: "Step along path",
  render: () => <SteppedStopsDemo haikus={DEMO_HAIKUS} />,
};
