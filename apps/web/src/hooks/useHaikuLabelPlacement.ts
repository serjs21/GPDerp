"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { updateHaikuLabelPlacement } from "@/api/labels";
import type { LabelPlacement } from "@/components/LabelHalo/consts/labelHaloConsts";
import { comicToast } from "@/components/ComicToast";

type UseHaikuLabelPlacementOptions = {
  haikuId: string | undefined;
  enabled?: boolean;
  onChanged?: () => void;
};

/**
 * Persists LabelHalo placement commits for a haiku.
 */
export function useHaikuLabelPlacement({
  haikuId,
  enabled = true,
  onChanged,
}: UseHaikuLabelPlacementOptions) {
  const t = useTranslations("LabelHooks");
  const [saving, setSaving] = useState(false);

  const onPlacementCommit = useCallback(
    async (labelId: string, placement: LabelPlacement) => {
      if (!enabled || !haikuId) return;
      setSaving(true);
      try {
        await updateHaikuLabelPlacement(haikuId, {
          labelId,
          xPercent: placement.xPercent,
          yPercent: placement.yPercent,
          rotateDeg: placement.rotateDeg,
        });
        onChanged?.();
      } catch {
        comicToast.error(t("placementError"));
      } finally {
        setSaving(false);
      }
    },
    [enabled, haikuId, onChanged, t],
  );

  return { onPlacementCommit, saving };
}
