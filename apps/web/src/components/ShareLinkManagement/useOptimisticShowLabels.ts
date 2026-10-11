"use client";

import { useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";

/**
 * Labels visibility for a share-link row, optimistic after a toggle until the list refetch
 * catches up (`base` stops matching the link).
 */
export function useOptimisticShowLabels(link: ShareLinkListItem) {
  const [labelsOverride, setLabelsOverride] = useState<{ base: boolean; value: boolean } | null>(null);
  const showLabels =
    labelsOverride && labelsOverride.base === link.showLabels ? labelsOverride.value : link.showLabels;

  const onLinkUpdate = (updated: ShareLinkListItem) =>
    setLabelsOverride({ base: link.showLabels, value: updated.showLabels });

  return { showLabels, onLinkUpdate };
}
