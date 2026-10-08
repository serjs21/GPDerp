import type { Prisma } from "../../../generated/prisma";

export const HAIKU_LIST_SORT_FIELDS = ["createdAt", "title"] as const;
export const HAIKU_LIST_SORT_ORDERS = ["asc", "desc"] as const;

export type HaikuListSortField = (typeof HAIKU_LIST_SORT_FIELDS)[number];
export type HaikuListSortOrder = (typeof HAIKU_LIST_SORT_ORDERS)[number];
export type HaikuListSort = { field: HaikuListSortField; order: HaikuListSortOrder };

/** Newest first — the list order before `sort` / `order` existed. */
export const DEFAULT_HAIKU_LIST_SORT: HaikuListSort = { field: "createdAt", order: "desc" };

export type HaikuListSortParseResult =
  | { ok: true; value: HaikuListSort }
  | { ok: false; error: string };

const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
  (values as readonly string[]).includes(value);

/**
 * Read GET /haiku `sort` (createdAt | title) and `order` (asc | desc).
 * Both are optional; `order` defaults to asc once `sort` is given.
 */
export function parseHaikuListSort(query: {
  sort?: string;
  order?: string;
}): HaikuListSortParseResult {
  const sort = query.sort?.trim() || undefined;
  const order = query.order?.trim() || undefined;
  if (sort !== undefined && !isOneOf(HAIKU_LIST_SORT_FIELDS, sort)) {
    return { ok: false, error: "Invalid sort" };
  }
  if (order !== undefined && !isOneOf(HAIKU_LIST_SORT_ORDERS, order)) {
    return { ok: false, error: "Invalid order" };
  }
  if (sort === undefined) {
    return order === undefined
      ? { ok: true, value: DEFAULT_HAIKU_LIST_SORT }
      : { ok: true, value: { field: DEFAULT_HAIKU_LIST_SORT.field, order } };
  }
  return { ok: true, value: { field: sort, order: order ?? "asc" } };
}

/** Prisma orderBy with tie-breakers so offset pages stay stable. */
export function haikuListOrderBy(sort: HaikuListSort): Prisma.HaikuOrderByWithRelationInput[] {
  const { order } = sort;
  if (sort.field === "title") {
    return [{ title: order }, { titleSuffix: order }, { createdAt: order }, { id: order }];
  }
  return [{ createdAt: order }, { id: order }];
}
