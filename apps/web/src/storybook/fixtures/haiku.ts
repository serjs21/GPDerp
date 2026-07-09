import type { HaikuDto } from "@/api/haikus";

export const STORY_ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
export const STORY_USER_ID = "00000000-0000-4000-8000-000000000002";
export const STORY_CREATED_AT = new Date("2026-01-15T12:00:00.000Z").toISOString();

export function makeMockHaiku(
  partial: Partial<HaikuDto> & Pick<HaikuDto, "id" | "body">,
): HaikuDto {
  return {
    title: "Mock subject",
    titleSuffix: 0,
    createdAt: STORY_CREATED_AT,
    accountId: STORY_ACCOUNT_ID,
    createdById: STORY_USER_ID,
    labels: [],
    ...partial,
  };
}
