import type { CSSProperties } from "react";
import { WAG_TAIL_ASSET_SIZES, WAG_TAIL_LOADER_DEFAULTS } from "../consts/wagTailLoaderConsts";
import type { WagTailLoaderProps } from "../WagTailLoader.types";

type ResolvedWagTailProps = Required<Omit<WagTailLoaderProps, "className">>;

const percentOfWidth = (widthRem: number, percent: number) => `${(widthRem * percent) / 100}rem`;

/** Root CSS custom properties: geometry in rem (children of a zero-size anchor can't use %), timing and poses. */
export function buildWagTailStyle(props: ResolvedWagTailProps): CSSProperties {
  const { widthRem } = props;
  const { base } = WAG_TAIL_ASSET_SIZES;
  return {
    "--wag-width": `${widthRem}rem`,
    "--wag-aspect": `${base.width} / ${base.height}`,
    "--wag-attach-x": `${props.attachXPercent}%`,
    "--wag-attach-y": `${props.attachYPercent}%`,
    "--wag-tail-width": percentOfWidth(widthRem, props.tailWidthPercent),
    "--wag-base-deg": `${props.baseRotationDeg}deg`,
    "--wag-step-deg": `${props.stepDeg}deg`,
    "--wag-base-jitter": `${props.baseJitterDeg}deg`,
    "--wag-step-jitter": `${props.stepJitterDeg}deg`,
    "--wag-step-ms": `${props.stepMs}ms`,
    "--wag-lines-x": percentOfWidth(widthRem, props.linesOffsetXPercent),
    "--wag-lines-y": percentOfWidth(widthRem, props.linesOffsetYPercent),
    "--wag-lines-width": percentOfWidth(widthRem, props.linesWidthPercent),
    "--wag-lines-base-deg": `${props.linesBaseRotationDeg}deg`,
    "--wag-lines-shift": `${props.linesShiftPx}px`,
    "--wag-lines-rotate": `${props.linesRotateDeg}deg`,
    ...backgroundSpinVars(props),
  } as CSSProperties;
}

/**
 * Stepped background cycle: `steps` poses (0, stepDeg, 2 x stepDeg, ...), one per tick, then it jumps back
 * to 0 instead of turning a full circle. `turnDeg` is where the keyframes end, one step past the last pose.
 */
export function backgroundSpin(stepDeg: number, stepCount: number): { steps: number; turnDeg: number } {
  const steps = Math.max(1, Math.round(stepCount));
  return { steps, turnDeg: steps * stepDeg };
}

function backgroundSpinVars(props: ResolvedWagTailProps): Record<string, string> {
  const { steps, turnDeg } = backgroundSpin(props.backgroundStepDeg, props.backgroundSteps);
  return {
    "--wag-bg-base-deg": `${props.backgroundBaseRotationDeg}deg`,
    "--wag-bg-size": `${props.backgroundSizePercent}%`,
    "--wag-bg-offset-x": `${props.backgroundOffsetXPercent}%`,
    "--wag-bg-offset-y": `${props.backgroundOffsetYPercent}%`,
    "--wag-bg-origin": `${props.backgroundOriginXPercent}% ${props.backgroundOriginYPercent}%`,
    "--wag-bg-steps": String(steps),
    "--wag-bg-turn": `${turnDeg}deg`,
    "--wag-bg-duration": `${steps * props.backgroundStepMs}ms`,
  };
}

/**
 * Opacity copy `index` shows on tick `tick`: the pattern moves `jumpSteps` copies per tick
 * (with 4 copies, a jump of 3 runs the pattern backwards one copy).
 */
export function tailOpacityAt(
  opacities: ResolvedWagTailProps["opacities"],
  jumpSteps: number,
  index: number,
  tick: number,
): number {
  const count = opacities.length;
  const position = (((index + jumpSteps * tick) % count) + count) % count;
  return opacities[position];
}

/** `--wag-c0..3`: the four `wagOpacity` keyframe values of one animated element. */
function opacityCycleVars(
  opacities: ResolvedWagTailProps["opacities"],
  jumpSteps: number,
  index: number,
): Record<string, string> {
  return Object.fromEntries(
    opacities.map((_, tick) => [`--wag-c${tick}`, String(tailOpacityAt(opacities, jumpSteps, index, tick))]),
  );
}

/** Copy index drives its rotation and its slot in the shared opacity pattern. */
export function tailCopyStyle(index: number, props: Pick<ResolvedWagTailProps, "opacities" | "opacityJumpSteps">): CSSProperties {
  return {
    "--wag-index": String(index),
    ...opacityCycleVars(props.opacities, props.opacityJumpSteps, index),
  } as CSSProperties;
}

/** The motion lines run the same opacity cycle as one element: tick t shows linesOpacities[jump x t]. */
export function linesStyle(props: Pick<ResolvedWagTailProps, "linesOpacities" | "linesOpacityJumpSteps">): CSSProperties {
  return opacityCycleVars(props.linesOpacities, props.linesOpacityJumpSteps, 0) as CSSProperties;
}

export function resolveWagTailProps(props: WagTailLoaderProps): ResolvedWagTailProps {
  const defined = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => key !== "className" && value !== undefined),
  );
  return { ...WAG_TAIL_LOADER_DEFAULTS, ...defined } as ResolvedWagTailProps;
}
