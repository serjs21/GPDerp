import type { CSSProperties } from "react";
import type { HaikuDto } from "@/api/haikus";
import {
  LABEL_HALO_DROP_PAD_EXTRA_REM,
  LABEL_HALO_DROP_PAD_REM,
} from "@/components/LabelHalo/consts/labelHaloConsts";
import { toLabelHaloItems } from "@/components/LabelHalo/utils/toLabelHaloItems";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { LANTERN_WIDTH_REM } from "../../constants";
import lanternStyles from "../../Lantern.module.css";
import { lanternTransformToCssVars, type LanternTransform } from "../../lanternTransform";
import styles from "../LanternPath.module.css";

type Translate = (key: string, values?: Record<string, string>) => string;
type PathLanternContent = { haiku?: HaikuDto; generatingDraft?: GeneratingDraft };

export function pathLanternAriaLabel(t: Translate, content: PathLanternContent): string {
  if (content.generatingDraft) return t("generating", { subject: content.generatingDraft.subject });
  if (content.haiku) return t("haikuLantern", { title: content.haiku.title });
  return t("lantern");
}

export function pathLanternHaloLabels(haiku: HaikuDto | undefined, excludeLabelIds: string[] | undefined) {
  return haiku?.labels ? toLabelHaloItems(haiku.labels, excludeLabelIds) : [];
}

export function pathLanternClassName(isFocused: boolean, className: string | undefined): string {
  return [
    lanternStyles.root,
    lanternStyles.pathPositioned,
    styles.flightPathLantern,
    isFocused ? styles.flightPathLanternFocused : "",
    styles.flightPathStopLantern,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function pathLanternStyle(transform: LanternTransform, isFocused: boolean): CSSProperties {
  const haloPadTopRem = LABEL_HALO_DROP_PAD_REM + LABEL_HALO_DROP_PAD_EXTRA_REM;
  return {
    ...lanternTransformToCssVars(transform),
    "--lantern-width": `${LANTERN_WIDTH_REM}rem`,
    // Focus stop was authored for the lantern box only; shift down so the
    // LabelHalo fill pad (top) stays inside the viewport.
    ...(isFocused ? { "--lantern-flight-y": `${haloPadTopRem}rem` } : null),
  } as CSSProperties;
}
