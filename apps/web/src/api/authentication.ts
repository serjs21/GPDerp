import axios from "axios";

export type CheckUsernameResponse = {
  ok: boolean;
  data: { available: boolean; normalized: string | null; reason: string | null };
};

export type ResendVerificationStatus = "sent" | "already_verified";

/** Verification email to the signed-in user's own address; 429 inside the API's resend cooldown. */
export async function resendVerificationForCurrentUser(): Promise<ResendVerificationStatus> {
  const { data } = await axios.post<{ ok: true; data: { status: ResendVerificationStatus } }>(
    "/auth/verify-email/resend-current",
  );
  return data.data.status;
}

export function isVerificationResendCooldownError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 429;
}

export async function fetchUsernameAvailability(username: string) {
  const { data } = await axios.get<CheckUsernameResponse>("/auth/check-username", {
    params: { username },
  });
  return data.data;
}

export async function registerWithEmailAndPassword(body: {
  email: string;
  password: string;
}): Promise<void> {
  await axios.post("/auth/register", body);
}

export async function completeRegistrationUsername(body: { userName: string }): Promise<void> {
  await axios.post("/auth/complete-registration", body);
}

/** Signs in, creating the account on first use with a username derived from the email. */
export async function continueWithGoogleCredential(credential: string): Promise<void> {
  await axios.post("/auth/google", { token: credential });
}

export type PostDebugAuthLogBody = {
  event?: string;
  reason: string;
  message: string;
  userId?: string | null;
  sessionId?: string | null;
  requestPath?: string | null;
  method?: string | null;
  tabId?: string | null;
  detail?: Record<string, unknown> | null;
};

/** Best-effort report of an involuntary client auth drop (no-ops / ignores errors). */
export async function postDebugAuthLog(body: PostDebugAuthLogBody): Promise<void> {
  try {
    await axios.post("/auth/debug-auth-log", body);
  } catch {
    // Never block logout UX on diagnostics.
  }
}
