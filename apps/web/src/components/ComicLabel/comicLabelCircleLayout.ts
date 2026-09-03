import type { ComicSourceDirection } from "@/components/ComicConfirmModal/comicSourceDirection";
import { sourceDirectionFromOutwardAngle } from "@/components/Lantern/lanternLabelRingLayout";

export type ComicLabelCircleItem = {
  id: string;
  name: string;
  color: string;
};

export type ComicLabelCircleSlot = {
  label: ComicLabelCircleItem;
  sourceDirection: ComicSourceDirection;
  x: number;
  y: number;
};

export function buildComicLabelCircleSlots(
  labels: readonly ComicLabelCircleItem[],
  options: { startAngle: number; radius: number },
): ComicLabelCircleSlot[] {
  const count = labels.length;
  return labels.map((label, index) => {
    const angle = options.startAngle + (index * 2 * Math.PI) / count;
    return {
      label,
      sourceDirection: sourceDirectionFromOutwardAngle(angle),
      x: 50 + Math.cos(angle) * options.radius * 100,
      y: 50 + Math.sin(angle) * options.radius * 100,
    };
  });
}

export function measureComicLabelCircleOrigins(
  stage: HTMLElement,
  slots: readonly ComicLabelCircleSlot[],
  getElement: (id: string) => HTMLElement | null | undefined,
): Record<string, { left: number; top: number }> {
  const next: Record<string, { left: number; top: number }> = {};
  for (const slot of slots) {
    const el = getElement(slot.label.id);
    if (!el) continue;
    const centerX = (slot.x / 100) * stage.clientWidth;
    const centerY = (slot.y / 100) * stage.clientHeight;
    next[slot.label.id] = {
      left: Math.round(centerX - el.offsetWidth / 2),
      top: Math.round(centerY - el.offsetHeight / 2),
    };
  }
  return next;
}

export function comicLabelOriginsKey(
  origins: Record<string, { left: number; top: number }>,
): string {
  return Object.entries(origins)
    .map(([id, origin]) => `${id}:${origin.left},${origin.top}`)
    .join("|");
}
