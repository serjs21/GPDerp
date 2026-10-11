"use client";

import { useTranslations } from "next-intl";
import { LabelHalo } from "@/components/LabelHalo/LabelHalo";
import { toLabelHaloItems } from "@/components/LabelHalo/utils/toLabelHaloItems";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import { SVG_PATH_LANTERN_WIDTH_REM } from "./consts/pathLanternLayoutConsts";
import type { PathLanternWithHaloProps } from "./SVGPathLantern.types";
import { haloPathLanternClassName, pathLanternCssVars } from "./utils/svgPathLanternUtils";

const IDENTITY_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  positionMode: "translate" as const,
};

/** Upright saved-haiku lantern wrapped in its fill LabelHalo (placement editable when interactive). */
export function PathLanternWithHalo({
  haiku,
  transform,
  flightStyle,
  lanternClass,
  exiting,
  ariaLabel,
  excludeLabelIds,
  interactive,
  onChanged,
  children,
}: PathLanternWithHaloProps) {
  const t = useTranslations("SVGPath.svgPathLantern");
  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku.id,
    enabled: interactive,
    onChanged,
  });
  const haloLabels = toLabelHaloItems(haiku.labels, excludeLabelIds);

  return (
    <div
      className={haloPathLanternClassName(lanternClass, exiting)}
      style={pathLanternCssVars(transform, flightStyle)}
      data-path-haiku-id={haiku.id}
    >
      <LabelHalo
        layout="fill"
        interactive={interactive}
        labels={haloLabels}
        onPlacementCommit={interactive ? onPlacementCommit : undefined}
        ariaLabel={t("labels", { label: ariaLabel })}
      >
        <LanternFrame
          transform={IDENTITY_TRANSFORM}
          flightExiting={exiting}
          widthRem={SVG_PATH_LANTERN_WIDTH_REM}
          ariaLabel={ariaLabel}
          showLabelBelt={false}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </LanternFrame>
      </LabelHalo>
    </div>
  );
}
