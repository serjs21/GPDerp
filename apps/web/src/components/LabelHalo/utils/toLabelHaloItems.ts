import type { HaikuLinkedLabelDto } from "@/api/haikus";
import type { LabelHaloLabelItem } from "../consts/labelHaloConsts";

/** Map API haiku labels into LabelHalo items. */
export function toLabelHaloItems(
  labels: ReadonlyArray<HaikuLinkedLabelDto>,
  excludeLabelIds?: ReadonlyArray<string>,
): LabelHaloLabelItem[] {
  const excluded = excludeLabelIds?.length ? new Set(excludeLabelIds) : null;
  return labels
    .filter((label) => !excluded?.has(label.id))
    .map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      shape: label.shape,
      xPercent: label.xPercent ?? 50,
      yPercent: label.yPercent ?? 50,
      rotateDeg: label.rotateDeg ?? 0,
      connection: label.xPercent < 50 ? "end" : "start",
    }));
}
