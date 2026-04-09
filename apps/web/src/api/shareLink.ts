import type { HaikuDto } from "@/api/haikus";

export type SharedHaikuPayload = {
  haiku: HaikuDto;
  remainingViews: number | null;
  permanent: boolean;
};

export type FetchSharedHaikuResult =
  | { ok: true; data: SharedHaikuPayload }
  | { ok: false; status: number; error: string };

const apiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof process.env.API_BASE_URL === "string" ? process.env.API_BASE_URL : "http://localhost:4000");

export const fetchSharedHaikuByHash = async (shareHash: string): Promise<FetchSharedHaikuResult> => {
  const res = await fetch(`${apiBaseUrl()}/share_link/${encodeURIComponent(shareHash)}`, {
    cache: "no-store",
  });

  const raw: unknown = await res.json().catch(() => null);
  if (typeof raw !== "object" || raw === null || !("ok" in raw)) {
    return { ok: false, status: res.status, error: "Invalid share-link response from server." };
  }

  if (!(raw as { ok: boolean }).ok) {
    const message =
      "error" in raw && typeof (raw as { error?: unknown }).error === "string"
        ? (raw as { error: string }).error
        : "This share link is unavailable.";
    return { ok: false, status: res.status, error: message };
  }

  if (!("data" in raw)) {
    return { ok: false, status: res.status, error: "Shared haiku payload is missing." };
  }

  return { ok: true, data: (raw as { data: SharedHaikuPayload }).data };
};
