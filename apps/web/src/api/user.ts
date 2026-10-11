import axios from "axios";
import type { AuthProvider } from "@/types";
import type { AppLocale, ThemeName } from "@/config/userConfiguration";

export type UserProfileResponse = {
  id: string;
  email: string;
  userName: string | null;
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
  configuration: {
    theme: ThemeName;
    language: AppLocale;
    /** Saved celestial theme slot; `null` follows the user's local clock. */
    celestialSlot: number | null;
  };
};

type ProfileApiResponse = { ok: true; data: UserProfileResponse } | { ok: false; error: string };

export async function fetchOwnProfile(): Promise<UserProfileResponse> {
  const { data } = await axios.get<ProfileApiResponse>("/user/profile");
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch profile");
  return data.data;
}

export async function updateOwnProfile(body: { firstName?: string; lastName?: string }): Promise<UserProfileResponse> {
  const { data } = await axios.patch<ProfileApiResponse>("/user/profile", body);
  if (!data.ok) throw new Error(data.error ?? "Failed to update profile");
  return data.data;
}

export async function updateOwnAvatar(avatar: string): Promise<UserProfileResponse> {
  const { data } = await axios.patch<ProfileApiResponse>("/user/profile/avatar", { avatar });
  if (!data.ok) throw new Error(data.error ?? "Failed to update avatar");
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

type UserConfigurationResponse =
  | { ok: true; data: UserProfileResponse["configuration"] }
  | { ok: false; error: string };

export async function updateOwnConfiguration(body: {
  theme?: ThemeName;
  language?: AppLocale;
  celestialSlot?: number | null;
}): Promise<UserProfileResponse["configuration"]> {
  const { data } = await axios.patch<UserConfigurationResponse>("/user/configuration", body);
  if (!data.ok) throw new Error(data.error ?? "Failed to update settings");
  return data.data;
}
