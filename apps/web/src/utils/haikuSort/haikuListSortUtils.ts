import type { HaikuDto, HaikuListSort } from "@/api/haikus";
import type { OrderSortValue } from "@/components/OrderDropdown";

const FIELD_BY_CATEGORY: Record<string, HaikuListSort["field"]> = {
  creationDate: "createdAt",
  alpacabet: "title",
};

/**
 * API sort for the header order dropdown, matching label sorting: asc = oldest first / A→Z,
 * desc reverses. Undefined for no selection and for newest first (the API default).
 */
export function orderSortToHaikuListSort(value: OrderSortValue): HaikuListSort | undefined {
  const field = value.categoryId ? FIELD_BY_CATEGORY[value.categoryId] : undefined;
  if (!field) return undefined;
  if (field === "createdAt" && value.direction === "desc") return undefined;
  return { field, order: value.direction };
}

const compareText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

/** Client mirror of the API order (title → suffix → createdAt → id); undefined = newest first. */
export function compareHaikusBySort(a: HaikuDto, b: HaikuDto, sort?: HaikuListSort): number {
  const field = sort?.field ?? "createdAt";
  const sign = (sort?.order ?? "desc") === "asc" ? 1 : -1;
  const delta =
    field === "title"
      ? compareText(a.title, b.title) ||
        a.titleSuffix - b.titleSuffix ||
        a.createdAt.localeCompare(b.createdAt) ||
        a.id.localeCompare(b.id)
      : a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
  return sign * delta;
}
