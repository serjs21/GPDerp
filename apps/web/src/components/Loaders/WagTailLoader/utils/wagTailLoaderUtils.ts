import type { CSSProperties } from "react";
import { WAG_TAIL_ASSET_SIZES, WAG_TAIL_LOADER_DEFAULTS } from "../consts/wagTailLoaderConsts";
import type { WagTailLoaderProps } from "../WagTailLoader.types";

type ResolvedWagTailProps = Required<Omit<WagTailLoaderProps, "className">>;

const percentOfWidth = (widthRem: number, percent: number) => `${(widthRem * percent) / 100}rem`;

/** Root CSS custom properties: geometry in rem (children of a zero-size anchor can't use %), timing and poses. */
export function buildWagTailStyle(props: ResolvedWagTailProps): CSSProperties {
  const { widthRem, opacities } = props;
  const { base } = WAG_TAIL_ASSET_SIZES;
  return {
    "--wag-width": `${widthRem}rem`,
    "--wag-aspect": `${base.width} / ${base.height}`,
    "--wag-attach-x": `${props.attachXPercent}%`,
    "--wag-attach-y": `${props.attachYPercent}%`,
    "--wag-tail-width": percentOfWidth(widthRem, props.tailWidthPercent),
    "--wag-base-deg": `${props.baseRotationDeg}deg`,
    "--wag-step-deg": `${props.stepDeg}deg`,
    "--wag-step-ms": `${props.stepMs}ms`,
    "--wag-o0": String(opacities[0]),
    "--wag-o1": String(opacities[1]),
    "--wag-o2": String(opacities[2]),
    "--wag-o3": String(opacities[3]),
    "--wag-lines-x": percentOfWidth(widthRem, props.linesOffsetXPercent),
    "--wag-lines-y": percentOfWidth(widthRem, props.linesOffsetYPercent),
    "--wag-lines-width": percentOfWidth(widthRem, props.linesWidthPercent),
    "--wag-lines-shift": `${props.linesShiftPx}px`,
    "--wag-lines-rotate": `${props.linesRotateDeg}deg`,
  } as CSSProperties;
}

/** Copy index drives both its rotation and its negative delay into the shared opacity cycle. */
export function tailCopyStyle(index: number): CSSProperties {
  return { "--wag-index": String(index) } as CSSProperties;
}

export function resolveWagTailProps(props: WagTailLoaderProps): ResolvedWagTailProps {
  const defined = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => key !== "className" && value !== undefined),
  );
  return { ...WAG_TAIL_LOADER_DEFAULTS, ...defined } as ResolvedWagTailProps;
}
