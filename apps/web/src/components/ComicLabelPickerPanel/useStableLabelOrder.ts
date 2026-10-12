"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LabelDto } from "@/api/labels";
import type { ComicLabelPickerSeedLabel } from "./ComicLabelPickerPanel";
import { matchesQuery, nextListOrder } from "./utils/labelPickerUtils";

type StableLabelOrderOptions = {
  active: boolean;
  query: string;
  pagedLabels: LabelDto[];
  knownLabels: ComicLabelPickerSeedLabel[] | undefined;
  selectedIds: string[];
  seedLabelIds: string[];
};

/** Labels to display, in an order that stays put while toggling/paging and rebuilds per query. */
export function useStableLabelOrder({
  active,
  query,
  pagedLabels,
  knownLabels,
  selectedIds,
  seedLabelIds,
}: StableLabelOrderOptions): ComicLabelPickerSeedLabel[] {
  const [listOrderIds, setListOrderIds] = useState<string[]>([]);
  const orderQueryKey = useRef<string | null>(null);

  const labelById = useMemo(() => {
    const map = new Map<string, ComicLabelPickerSeedLabel>();
    for (const label of knownLabels ?? []) {
      map.set(label.id, label);
    }
    for (const label of pagedLabels) {
      map.set(label.id, { id: label.id, name: label.name, color: label.color, shape: label.shape });
    }
    return map;
  }, [knownLabels, pagedLabels]);

  useEffect(() => {
    if (!active) {
      orderQueryKey.current = null;
      setListOrderIds((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const rebuild = orderQueryKey.current !== query;
    if (rebuild) orderQueryKey.current = query;
    const leadIds = selectedIds.length > 0 ? selectedIds : seedLabelIds;
    setListOrderIds((prev) => nextListOrder(prev, { rebuild, leadIds, labelById, pagedLabels, query }));
  }, [active, query, pagedLabels, selectedIds, labelById, seedLabelIds]);

  return useMemo(
    () =>
      listOrderIds
        .map((id) => labelById.get(id))
        .filter((label): label is ComicLabelPickerSeedLabel => Boolean(label))
        .filter((label) => matchesQuery(label.name, query)),
    [listOrderIds, labelById, query],
  );
}
