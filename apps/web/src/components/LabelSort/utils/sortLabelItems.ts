import type { LabelDto } from "@/api/labels";
import type { LabelSortValue } from "../consts/labelSortConsts";

const connectionCount = (label: LabelDto): number =>
  label.connectedHaikus?.total ?? 0;

function compareCreatedAtAsc(a: LabelDto, b: LabelDto): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function compareAsc(a: LabelDto, b: LabelDto, categoryId: string): number {
  switch (categoryId) {
    case "creationDate":
      return compareCreatedAtAsc(a, b);
    case "alpacabet":
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "connection": {
      const delta = connectionCount(a) - connectionCount(b);
      if (delta !== 0) return delta;
      return compareCreatedAtAsc(b, a);
    }
    default:
      return compareCreatedAtAsc(b, a);
  }
}

/** Asc builds the category order; `desc` reverses the full list (matches share links). */
export function sortLabelItems(labels: LabelDto[], sort: LabelSortValue): LabelDto[] {
  if (sort.categoryId == null) return labels;
  const ascending = [...labels].sort((a, b) => compareAsc(a, b, sort.categoryId!));
  return sort.direction === "desc" ? ascending.reverse() : ascending;
}
