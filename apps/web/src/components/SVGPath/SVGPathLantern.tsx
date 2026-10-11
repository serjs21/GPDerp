"use client";

import { useTranslations } from "next-intl";
import { isLanternTransformHidden } from "@/components/Lantern/lanternTransform";
import { withDefaults } from "@/utils/props/withDefaults";
import { GeneratingPathLantern } from "./GeneratingPathLantern";
import type { StopFace } from "./pathStopRotation";
import { SavedPathLantern } from "./SavedPathLantern";
import type { PathLanternResolved, SVGPathLanternProps } from "./SVGPathLantern.types";
import {
  pathLanternShowsActions,
  svgPathLanternAriaLabel,
  svgPathLanternClassName,
} from "./utils/svgPathLanternUtils";

export type { SVGPathLanternProps } from "./SVGPathLantern.types";

const UPRIGHT_FACE: StopFace = { kind: "upright" };

const SVG_PATH_LANTERN_DEFAULTS = {
  loading: false,
  isAnimating: false,
  suppressReveal: false,
  actionsAlwaysVisible: false,
};

export function SVGPathLantern(props: SVGPathLanternProps) {
  const { loading, isAnimating, suppressReveal, actionsAlwaysVisible } = withDefaults(
    props,
    SVG_PATH_LANTERN_DEFAULTS,
  );
  const { haiku, generatingDraft, transform } = props;
  const t = useTranslations("SVGPath.svgPathLantern");
  if (isLanternTransformHidden(transform)) {
    return null;
  }

  const resolved: PathLanternResolved = {
    transform,
    face: props.face ?? UPRIGHT_FACE,
    isAnimating,
    suppressReveal,
    ariaLabel: svgPathLanternAriaLabel(t, { loading, generatingDraft, haiku }),
    showActions: pathLanternShowsActions({ isAnimating, loading, actionsAlwaysVisible }),
    lanternClass: svgPathLanternClassName(isAnimating),
  };

  if (haiku) {
    return (
      <SavedPathLantern
        {...resolved}
        haiku={haiku}
        loading={loading}
        excludeLabelIds={props.excludeLabelIds}
        onDeleted={props.onDeleted}
        onDeleteFailed={props.onDeleteFailed}
        onExitComplete={props.onExitComplete}
        onChanged={props.onChanged}
      />
    );
  }

  return <GeneratingPathLantern {...resolved} generatingDraft={generatingDraft} loading={loading} />;
}
