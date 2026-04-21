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

export async function loginWithGoogleCredential(credential: string): Promise<void> {
  await axios.post("/auth/google/login", { token: credential });
}
