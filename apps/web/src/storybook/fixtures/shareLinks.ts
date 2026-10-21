import type { HaikuDto } from "@/api/haikus";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { makeMockHaiku } from "./haiku";
import { WISDOM_FOREST_BODIES } from "./haikuBodies";

const SUBJECTS = ["Night questions", "Empty sky", "Winter pond", "Cherry blossoms"] as const;

/** Haikus the share links point at (answered by POST /haiku/batch). */
export const STORY_SHARED_HAIKUS: HaikuDto[] = SUBJECTS.map((subject, index) =>
  makeMockHaiku({
    id: `00000000-0000-4000-8000-${String(401 + index).padStart(12, "0")}`,
    title: subject,
    titleSuffix: 0,
    body: WISDOM_FOREST_BODIES[index % WISDOM_FOREST_BODIES.length],
  }),
);

/** One share link per status: active, inactive, expired, view limit reached. */
export const STORY_SHARE_LINKS: ShareLinkListItem[] = STORY_SHARED_HAIKUS.map((haiku, index) => ({
  id: `00000000-0000-4000-8000-${String(501 + index).padStart(12, "0")}`,
  shareHash: `story-hash-${index + 1}`,
  shareUrl: `https://gpderp.app/share/story-hash-${index + 1}`,
  haikuSubject: haiku.title,
  sharedHaikuId: haiku.id,
  createdAt: new Date(Date.UTC(2026, 0, 10 - index, 12)).toISOString(),
  expirationDate: index === 2 ? new Date(Date.UTC(2026, 0, 12)).toISOString() : null,
  maxViews: index === 3 ? 5 : null,
  viewCount: index === 3 ? 5 : 2 + index,
  disabled: index === 1,
  deactivationReason: index === 1 ? "manual" : null,
  showLabels: true,
}));
