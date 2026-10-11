import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";

type Translate = (key: string, values?: Record<string, string | number>) => string;

/** HUD line: generating subject, else the focused haiku's position, else the empty message. */
export function lanternPathHudLabel(
  t: Translate,
  params: { generatingDraft: GeneratingDraft | null | undefined; haikus: HaikuDto[]; focusIndex: number },
): string {
  const { generatingDraft, haikus, focusIndex } = params;
  if (generatingDraft) return t("generating", { subject: generatingDraft.subject });
  const focusHaiku = haikus[focusIndex];
  if (!focusHaiku) return t("empty");
  return t("focusPosition", {
    title: focusHaiku.title || t("untitled"),
    position: focusIndex + 1,
    total: haikus.length,
  });
}
