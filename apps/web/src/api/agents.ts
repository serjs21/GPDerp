import axios from "axios";
import { notifyGenerationCreditsUpdated } from "@/api/payments";

export type RunHaikuAgentResponse = {
  ok: boolean;
  creditsRemaining?: number;
};

export function isInsufficientCreditsError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status === 402) return true;
  const body = error.response?.data as { error?: string } | undefined;
  return body?.error === "insufficient_credits";
}

export function insufficientCreditsMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data as { message?: unknown } | undefined;
  return typeof body?.message === "string" ? body.message : null;
}

export const runHaikuAgent = async (subject: string): Promise<RunHaikuAgentResponse> => {
  const { data } = await axios.post<RunHaikuAgentResponse>("beer_me_haiku", { subject });
  if (typeof data.creditsRemaining === "number") {
    notifyGenerationCreditsUpdated(data.creditsRemaining);
  }
  return data;
};
