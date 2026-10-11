"use client";

import { useTranslations } from "next-intl";
import { LabelHalo } from "@/components/LabelHalo/LabelHalo";
import type { LanternRotatedFaceProps } from "./LanternRotatedFace.types";
import styles from "./LanternRotated.module.css";
import { shouldShowFaceHalo } from "./utils/rotatedShellUtils";

/** Paper-face content, wrapped in a LabelHalo on the same plane when face labels are enabled. */
export function LanternRotatedFace({ faceHalo, ariaLabel, children }: LanternRotatedFaceProps) {
  const t = useTranslations("Lantern.lanternRotatedShell");
  const content = <div className={styles.content}>{children}</div>;

  if (!shouldShowFaceHalo(faceHalo)) return content;

  return (
    <LabelHalo
      layout="fill"
      labels={faceHalo.labels}
      interactive={faceHalo.interactive ?? false}
      onPlacementCommit={faceHalo.onPlacementCommit}
      ariaLabel={faceHalo.ariaLabel ?? t("labels", { label: ariaLabel })}
    >
      {content}
    </LabelHalo>
  );
}
