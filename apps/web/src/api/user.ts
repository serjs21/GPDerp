import axios from "axios";
import type { AuthProvider } from "@/types";

export type UserProfileResponse = {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatar: string;
  avatarManuallySet: boolean;
  emailVerifiedAt: string | null;
  providers: AuthProvider[];
  pendingEmailChange: {
    newEmail: string;
    expiresAt: string;
    requestedAt: string;
  } | null;
};

type ProfileApiResponse = { ok: true; data: UserProfileResponse } | { ok: false; error: string };

export async function fetchOwnProfile(): Promise<UserProfileResponse> {
  const { data } = await axios.get<ProfileApiResponse>("/user/profile");
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch profile");
  return data.data;
}

export async function updateOwnProfile(body: {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}): Promise<UserProfileResponse> {
  const { data } = await axios.patch<ProfileApiResponse>("/user/profile", body);
  if (!data.ok) throw new Error(data.error ?? "Failed to update profile");
  return data.data;
}

type EmailChangeResponse = { ok: true; data: { pendingEmail: string } } | { ok: false; error: string };

export async function requestEmailChange(newEmail: string): Promise<{ pendingEmail: string }> {
  const { data } = await axios.post<EmailChangeResponse>("/user/change-email/request", { newEmail });
  if (!data.ok) throw new Error(data.error ?? "Failed to create email change request");
  return data.data;
}

export async function resendEmailChange(newEmail?: string): Promise<{ pendingEmail: string }> {
  const { data } = await axios.post<EmailChangeResponse>("/user/change-email/resend", { newEmail });
  if (!data.ok) throw new Error(data.error ?? "Failed to resend email change verification");
  return data.data;
}
