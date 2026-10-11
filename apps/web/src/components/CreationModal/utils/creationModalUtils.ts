import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";

type Translate = (key: string, values?: Record<string, string>) => string;

export function creationLanternAriaLabel(
  t: Translate,
  generatingDraft: GeneratingDraft | null | undefined,
  activeHaiku: HaikuDto | null,
): string {
  if (generatingDraft) return t("generating", { subject: generatingDraft.subject });
  if (activeHaiku) return t("haikuLantern", { title: activeHaiku.title ?? "" });
  return t("creation");
}

/** Prefer the session key so draft → saved does not remount `.flyIn`. */
export function creationFlyInKey(
  lanternSessionKey: string | null | undefined,
  generatingDraft: GeneratingDraft | null | undefined,
  activeHaiku: HaikuDto | null,
): string {
  return lanternSessionKey ?? generatingDraft?.requestId ?? activeHaiku?.id ?? "lantern";
}
