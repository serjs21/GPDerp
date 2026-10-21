import type { CSSProperties } from "react";
import { LANTERN_LOADER_ASSET, LANTERN_LOADER_DEFAULTS } from "../consts/lanternLoaderConsts";
import type { LanternLoaderProps, LanternLoaderStep } from "../LanternLoader.types";

type ResolvedLanternProps = Required<Omit<LanternLoaderProps, "className">>;

export function resolveLanternProps(props: LanternLoaderProps): ResolvedLanternProps {
  return {
    widthRem: props.widthRem ?? LANTERN_LOADER_DEFAULTS.widthRem,
    steps: props.steps ?? LANTERN_LOADER_DEFAULTS.steps,
    stepTransitionMs: props.stepTransitionMs ?? LANTERN_LOADER_DEFAULTS.stepTransitionMs,
  };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

function stepDeclarations(step: LanternLoaderStep): string {
  return (
    `transform: translate(${step.xPercent}%, ${step.yPercent}%) rotate(${step.rotationDeg}deg) scale(${step.scale}); ` +
    `opacity: ${step.opacity};`
  );
}

/** Stable per-config name, so identical lanterns share one keyframes rule (and SSR matches the client). */
export function lanternKeyframesName(steps: readonly LanternLoaderStep[]): string {
  let hash = 5381;
  for (const char of JSON.stringify(steps)) hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  return `lanternLoader-${hash.toString(36)}`;
}

/**
 * One keyframe per step at i / n of the loop, plus 100% = the first step so the loop closes smoothly.
 * The CSS timing function applies per segment, so each step-to-step transition eases on its own.
 */
export function buildLanternKeyframes(name: string, steps: readonly LanternLoaderStep[]): string {
  const frames = steps.map((step, index) => `${round((index / steps.length) * 100)}% { ${stepDeclarations(step)} }`);
  return `@keyframes ${name} { ${frames.join(" ")} 100% { ${stepDeclarations(steps[0])} } }`;
}

export function buildLanternStyle(props: ResolvedLanternProps, keyframesName: string | null): CSSProperties {
  return {
    "--lantern-width": `${props.widthRem}rem`,
    "--lantern-aspect": `${LANTERN_LOADER_ASSET.width} / ${LANTERN_LOADER_ASSET.height}`,
    "--lantern-animation-name": keyframesName ?? "none",
    "--lantern-duration": `${props.steps.length * props.stepTransitionMs}ms`,
  } as CSSProperties;
}
