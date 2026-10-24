import axios from "axios";

export type CheckUsernameResponse = {
  ok: boolean;
  data: { available: boolean; normalized: string | null; reason: string | null };
};

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

/** Sign in only: answers 409 GOOGLE_SIGNUP_REQUIRED when no account exists for this Google identity. */
export async function loginWithGoogleCredential(credential: string): Promise<void> {
  await axios.post("/auth/google/login", { token: credential });
}

/** Sign up (or sign in): creates the account on first use, with a username derived from the email. */
export async function signUpWithGoogleCredential(credential: string): Promise<void> {
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
