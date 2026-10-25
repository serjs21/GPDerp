import axios from "axios";
import { notifyGenerationCreditsUpdated } from "@/api/payments";
import { HAIKU_STREAM_SOCKET_WAIT_MS } from "@/consts/webSocket/webSocketConsts";
import { getSharedSocket } from "@/utils/webSocket/sharedSocketManager";

export type RunHaikuAgentResponse = {
  ok: boolean;
  creditsRemaining?: number;
};

/** 403 from generation while the account's email is unverified. */
export function isEmailNotVerifiedError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const body = error.response?.data as { code?: string } | undefined;
  return error.response?.status === 403 && body?.code === "EMAIL_NOT_VERIFIED";
}

export function isInsufficientCreditsError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status === 402) return true;
  const body = error.response?.data as { error?: string } | undefined;
  return body?.error === "insufficient_credits";
}

/** Reads `message` from a 402 `insufficient_credits` response body. */
export function readInsufficientCreditsMessage(body: unknown): string | null {
  const message = (body as { message?: unknown } | null | undefined)?.message;
  return typeof message === "string" ? message : null;
}

export function insufficientCreditsMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  return readInsufficientCreditsMessage(error.response?.data);
}

export const runHaikuAgent = async (subject: string): Promise<RunHaikuAgentResponse> => {
  // The stream is pushed to this tab's socket: give a (re)connecting socket a moment, but never block generation on it.
  await getSharedSocket().whenOpen(HAIKU_STREAM_SOCKET_WAIT_MS);
  const { data } = await axios.post<RunHaikuAgentResponse>("beer_me_haiku", { subject });
  if (typeof data.creditsRemaining === "number") {
    notifyGenerationCreditsUpdated(data.creditsRemaining);
  }
  return data;
};
