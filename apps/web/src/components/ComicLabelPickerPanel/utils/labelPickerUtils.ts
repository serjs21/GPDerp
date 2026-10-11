import type { CSSProperties } from "react";
import type { ComicLabelPickerSeedLabel } from "../ComicLabelPickerPanel";

const FALLBACK_LABEL_COLOR = "#888888";

export function chunkRows<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function matchesQuery(name: string, q: string): boolean {
  const trimmed = q.trim();
  if (!trimmed) return true;
  return name.toLowerCase().includes(trimmed.toLowerCase());
}

export function labelFill(color: string): string {
  return color || FALLBACK_LABEL_COLOR;
}

export function selectedPanelStyle(color: string): CSSProperties {
  return {
    "--comic-panel-base": `color-mix(in srgb, ${labelFill(color)} 50%, #ffffff)`,
  } as CSSProperties;
}

/**
 * Next display order for the picker list. Order is append-only within one query so toggling or
 * paging never reshuffles what the user is looking at; a new query rebuilds it with the selection
 * (or seed) first, then catalog order. Returns `prev` itself when nothing changed.
 */
export function nextListOrder(
  prev: string[],
  params: {
    rebuild: boolean;
    leadIds: string[];
    labelById: Map<string, ComicLabelPickerSeedLabel>;
    pagedLabels: ReadonlyArray<{ id: string; name: string }>;
    query: string;
  },
): string[] {
  const { rebuild, leadIds, labelById, pagedLabels, query } = params;
  const base = rebuild ? [] : prev;
  const seen = new Set(base);
  const next = [...base];

  if (next.length === 0) {
    for (const id of leadIds) {
      const label = labelById.get(id);
      if (!label || !matchesQuery(label.name, query)) continue;
      next.push(id);
      seen.add(id);
    }
  }

  for (const label of pagedLabels) {
    if (seen.has(label.id)) continue;
    if (!matchesQuery(label.name, query)) continue;
    next.push(label.id);
    seen.add(label.id);
  }

  const keptPrev = !rebuild && next.length === base.length && next.every((id, i) => id === base[i]);
  return keptPrev ? prev : next;
}
