import type { LabelDto } from "@/api/labels";

/**
 * Live API order (createdAt desc → newest first) with rows that are still playing their delete exit
 * re-inserted after the neighbor they followed previously (or at the top when that neighbor is gone).
 */
export function mergeDisplayLabels(
  previousOrder: string[],
  pagedLabels: LabelDto[],
  exitingById: Record<string, LabelDto>,
): { order: string[]; labels: LabelDto[] } {
  const liveById = new Map(pagedLabels.map((label) => [label.id, label]));
  const order = pagedLabels.map((label) => label.id);

  for (const id of Object.keys(exitingById)) {
    if (liveById.has(id)) continue;
    const prevIndex = previousOrder.indexOf(id);
    if (prevIndex <= 0) {
      order.unshift(id);
      continue;
    }
    const neighborBefore = previousOrder
      .slice(0, prevIndex)
      .reverse()
      .find((neighborId) => order.includes(neighborId));
    if (neighborBefore != null) {
      order.splice(order.indexOf(neighborBefore) + 1, 0, id);
    } else {
      order.unshift(id);
    }
  }

  const labels = order
    .map((id) => liveById.get(id) ?? exitingById[id])
    .filter((label): label is LabelDto => Boolean(label));

  return { order, labels };
}

export type LabelSortPlacement = "side" | "frame" | "none";

/** Sort + create render in the side panel portal, beside each other above the list, or not at all. */
export function labelSortPlacement(showSort: boolean, sidePanelTarget: HTMLElement | null | undefined): LabelSortPlacement {
  if (!showSort) return "none";
  return sidePanelTarget != null ? "side" : "frame";
}
