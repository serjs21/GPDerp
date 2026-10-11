"use client";

import { useTranslations } from "next-intl";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { LabelHalo } from "@/components/LabelHalo/LabelHalo";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import { LanternFrame } from "../LanternFrame";
import { Lantern, type LanternProps } from "../Lantern";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import { resolveLanternAtPathStop } from "./resolveLanternAtPathStop";
import { isLanternTransformHidden } from "../lanternTransform";
import {
  pathLanternAriaLabel,
  pathLanternClassName,
  pathLanternHaloLabels,
  pathLanternStyle,
} from "./utils/lanternPathLanternUtils";

export type LanternPathLanternProps = HaikuContainerProps & {
  pathStop: number;
  className?: string;
  excludeLabelIds?: string[];
  onDeleted?: () => void;
  onChanged?: () => void;
};

const IDENTITY_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  positionMode: "translate" as const,
};

export function LanternPathLantern({
  pathStop,
  className,
  excludeLabelIds,
  onDeleted,
  onChanged,
  ...contentProps
}: LanternPathLanternProps) {
  const t = useTranslations("Lantern.lanternPathLantern");
  const transform = resolveLanternAtPathStop(pathStop);
  const isFocused = Math.abs(pathStop - LANTERN_PATH_FOCUS_STOP) < 0.5;
  const { haiku, generatingDraft } = contentProps;

  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku?.id,
    enabled: isFocused,
    onChanged,
  });

  if (isLanternTransformHidden(transform)) {
    return null;
  }

  const ariaLabel = pathLanternAriaLabel(t, contentProps);

  return (
    <div className={pathLanternClassName(isFocused, className)} style={pathLanternStyle(transform, isFocused)}>
      <LabelHalo
        layout="fill"
        interactive={isFocused}
        labels={pathLanternHaloLabels(haiku, excludeLabelIds)}
        onPlacementCommit={isFocused ? onPlacementCommit : undefined}
        ariaLabel={t("labels", { label: ariaLabel })}
      >
        <LanternFrame
          transform={IDENTITY_TRANSFORM}
          ariaLabel={ariaLabel}
          generating={Boolean(generatingDraft)}
          showLabelBelt={false}
          style={{ width: "100%", height: "100%" }}
        >
          <Lantern
            {...({
              ...contentProps,
              bodyOnly: !isFocused,
              onDeleted,
              onChanged,
            } as LanternProps)}
          />
        </LanternFrame>
      </LabelHalo>
    </div>
  );
}
