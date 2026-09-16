export const GENERATION_CREDITS_SOCKET_KIND = "generation_credits";

export function parseGenerationCreditsMessage(raw: string): { credits: number } | null {
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    if (parsed.kind !== GENERATION_CREDITS_SOCKET_KIND) return null;
    const data = parsed.data as { credits?: unknown } | undefined;
    if (!data || typeof data.credits !== "number" || !Number.isFinite(data.credits)) return null;
    return { credits: data.credits };
  } catch {
    return null;
  }
}
