"use client";

import { useTranslations } from "next-intl";
import { toLabelHaloItems } from "@/components/LabelHalo/utils/toLabelHaloItems";
import { Lantern } from "@/components/Lantern/Lantern";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import { SVG_PATH_LANTERN_WIDTH_REM } from "./consts/pathLanternLayoutConsts";
import { RotatedPathAnchor } from "./RotatedPathAnchor";
import type { RotatedPathLanternWithHaloProps } from "./SVGPathLantern.types";

/** Rotated-base saved-haiku lantern; its LabelHalo lives on the skewed paper face. */
export function RotatedPathLanternWithHalo({
  haiku,
  transform,
  flightStyle,
  suppressReveal,
  isAnimating,
  ariaLabel,
  face,
  excludeLabelIds,
  interactive,
  showActions,
  onDelete,
  onChanged,
}: RotatedPathLanternWithHaloProps) {
  const t = useTranslations("SVGPath.svgPathLantern");
  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku.id,
    enabled: interactive,
    onChanged,
  });
  const haloLabels = toLabelHaloItems(haiku.labels, excludeLabelIds);

  return (
    <RotatedPathAnchor
      transform={transform}
      flightStyle={flightStyle}
      suppressReveal={suppressReveal}
      isAnimating={isAnimating}
      ariaLabel={ariaLabel}
      pathHaikuId={haiku.id}
    >
      <Lantern
        haiku={haiku}
        rotationBase={face.variant}
        mirrored={face.mirrored}
        showActions={showActions}
        onDelete={onDelete}
        onChanged={onChanged}
        widthRem={SVG_PATH_LANTERN_WIDTH_REM}
        style={{ width: "100%", height: "100%", animation: "none" }}
        faceHalo={{
          labels: haloLabels,
          interactive,
          onPlacementCommit: interactive ? onPlacementCommit : undefined,
          ariaLabel: t("labels", { label: ariaLabel }),
        }}
      />
    </RotatedPathAnchor>
  );
}
