import type { CSSProperties } from "react";
import type { HaikuDto } from "@/api/haikus";
import {
  LANTERN_FLAME_ANCHOR_Y,
  LANTERN_FLAME_BOTTOM,
  LANTERN_FLAME_HEIGHT,
} from "@/components/Lantern/constants";
import lanternStyles from "@/components/Lantern/Lantern.module.css";
import { lanternTransformToCssVars, type LanternTransform } from "@/components/Lantern/lanternTransform";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { SVG_PATH_LANTERN_WIDTH_REM } from "../consts/pathLanternLayoutConsts";
import styles from "../SVGPath.module.css";

type Translate = (key: string, values?: Record<string, string>) => string;

const joinClasses = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

/** Flame CSS vars required on every pathPositioned root (not only LanternFrame). */
export function pathLanternCssVars(transform: LanternTransform, flightStyle?: CSSProperties): CSSProperties {
  return {
    ...lanternTransformToCssVars(transform),
    ...flightStyle,
    "--lantern-width": `${SVG_PATH_LANTERN_WIDTH_REM}rem`,
    "--lantern-flame-bottom": String(LANTERN_FLAME_BOTTOM),
    "--lantern-flame-height": String(LANTERN_FLAME_HEIGHT),
    "--lantern-flame-anchor-y": String(LANTERN_FLAME_ANCHOR_Y),
  } as CSSProperties;
}

export function svgPathLanternAriaLabel(
  t: Translate,
  params: { loading: boolean; generatingDraft: GeneratingDraft | null | undefined; haiku: HaikuDto | undefined },
): string {
  if (params.loading) return t("loadingMore");
  if (params.generatingDraft) return t("generating", { subject: params.generatingDraft.subject });
  return t("haikuLantern", { title: params.haiku?.title ?? "" });
}

/** Actions only on the settled focus-stop lantern. */
export function pathLanternShowsActions(params: {
  isAnimating: boolean;
  loading: boolean;
  actionsAlwaysVisible: boolean;
}): boolean {
  return !params.isAnimating && !params.loading && params.actionsAlwaysVisible;
}

export function svgPathLanternClassName(isAnimating: boolean): string {
  return joinClasses(styles.lantern, isAnimating && styles.lanternAnimating);
}

export function rotatedPathAnchorClassName(suppressReveal: boolean, isAnimating: boolean): string {
  return joinClasses(
    lanternStyles.root,
    lanternStyles.pathPositioned,
    styles.lantern,
    suppressReveal && lanternStyles.flightExiting,
    isAnimating && styles.lanternAnimating,
  );
}

export function haloPathLanternClassName(lanternClass: string, exiting: boolean): string {
  return joinClasses(lanternStyles.root, lanternStyles.pathPositioned, lanternClass, exiting && lanternStyles.flightExiting);
}

export function pathHaikuIdAttribute(pathHaikuId: string | undefined) {
  return pathHaikuId ? { "data-path-haiku-id": pathHaikuId } : {};
}
