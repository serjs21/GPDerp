"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComicLabelPickerPanelProps, ComicLabelPickerSeedLabel } from "./ComicLabelPickerPanel";

type LabelPickerSelectionOptions = Pick<
  ComicLabelPickerPanelProps,
  "active" | "seedLabelIds" | "disabledIds" | "maxSelected" | "onSelectionChange"
>;

/**
 * Selected label ids: seeded once per activation from `seedLabelIds`, reported to the parent on
 * every change while active, and capped by `maxSelected` (deselect always works).
 */
export function useLabelPickerSelection({
  active,
  seedLabelIds,
  disabledIds,
  maxSelected,
  onSelectionChange,
}: LabelPickerSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => (active ? [...seedLabelIds] : []));
  const [seededActive, setSeededActive] = useState(active);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const disabledIdSet = useMemo(() => new Set(disabledIds ?? []), [disabledIds]);

  if (seededActive !== active) {
    setSeededActive(active);
    if (active) setSelectedIds([...seedLabelIds]);
  }

  useEffect(() => {
    if (!active) return;
    onSelectionChange?.(selectedIds);
  }, [active, selectedIds, onSelectionChange]);

  const toggleLabel = (label: ComicLabelPickerSeedLabel) => {
    if (disabledIdSet.has(label.id)) return;
    setSelectedIds((prev) => {
      if (prev.includes(label.id)) {
        return prev.filter((id) => id !== label.id);
      }
      if (maxSelected != null && prev.length >= maxSelected) {
        return prev;
      }
      return [...prev, label.id];
    });
  };

  return { selectedIds, selectedIdSet, disabledIdSet, toggleLabel };
}
