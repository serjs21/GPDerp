"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { LabelHalo, toLabelHaloItems } from "@/components/LabelHalo";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import type { ShareLinkPreviewLanternProps } from "./ShareLinkPreviewModal.types";
import styles from "./ShareLinkPreviewModal.module.css";

/** Shared haiku lantern with its draggable label halo (dimmed when the link hides labels). */
export function ShareLinkPreviewLantern({ subject, haiku, showLabels, onHaikuChanged }: ShareLinkPreviewLanternProps) {
  const t = useTranslations("ShareLinkPreviewModal");
  const { onPlacementCommit } = useHaikuLabelPlacement({ haikuId: haiku.id, onChanged: onHaikuChanged });
  const haloLabels = useMemo(() => toLabelHaloItems(haiku.labels ?? []), [haiku.labels]);

  return (
    <LabelHalo
      labels={haloLabels}
      onPlacementCommit={(labelId, placement) => void onPlacementCommit(labelId, placement)}
      ariaLabel={t("labelsAriaLabel", { subject })}
      className={showLabels ? undefined : styles.labelsHidden}
    >
      <LanternFrame ariaLabel={t("lanternAriaLabel", { subject })} showLabelBelt={false}>
        <Lantern haiku={haiku} showActions={false} bodyOnly />
      </LanternFrame>
    </LabelHalo>
  );
}
