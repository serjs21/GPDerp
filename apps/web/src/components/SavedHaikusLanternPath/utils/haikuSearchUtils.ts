import type { HaikuDto, HaikuListSort } from "@/api/haikus";
import { compareHaikusBySort } from "@/utils/haikuSort/haikuListSortUtils";

export const normalizeHaikuSearch = (search: string): string => search.trim().toLowerCase();

/** Same rule as the API: case-insensitive substring of the title. */
export const haikuMatchesSearch = (haiku: HaikuDto, normalizedSearch: string): boolean =>
  !normalizedSearch || haiku.title.toLowerCase().includes(normalizedSearch);

/** Already-fetched matches plus API results in `sort` order (newest first by default), one entry per id. */
export function mergeHaikuSearchResults(
  localMatches: HaikuDto[],
  searchResults: HaikuDto[],
  sort?: HaikuListSort,
): HaikuDto[] {
  const byId = new Map<string, HaikuDto>();
  for (const haiku of localMatches) byId.set(haiku.id, haiku);
  for (const haiku of searchResults) if (!byId.has(haiku.id)) byId.set(haiku.id, haiku);
  return [...byId.values()].sort((a, b) => compareHaikusBySort(a, b, sort));
}

export function filterHaikusByLabels(
  haikus: HaikuDto[],
  includeLabelIds: string[],
  excludeLabelIds: string[],
): HaikuDto[] {
  let result = haikus;
  if (includeLabelIds.length > 0) {
    result = result.filter((haiku) => haiku.labels.some((label) => includeLabelIds.includes(label.id)));
  }
  if (excludeLabelIds.length > 0) {
    result = result.filter((haiku) => !haiku.labels.some((label) => excludeLabelIds.includes(label.id)));
  }
  return result;
}
