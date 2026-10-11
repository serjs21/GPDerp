import type { UserProfileResponse } from "@/api/user";
import { AuthProvider } from "@/types";
import { EMAIL_CHANGE_TTL_MS } from "../consts/profileTabsConsts";

/** Settings render only for a signed-in user once the profile request settled. */
export function isProfilePageReady(initialized: boolean, isLoggedIn: boolean, loading: boolean): boolean {
  return initialized && isLoggedIn && !loading;
}

export function pendingNewEmailOf(profile: UserProfileResponse | null): string | null {
  return profile?.pendingEmailChange?.newEmail ?? null;
}

/** Optimistic pending-email state after a change request / resend succeeds. */
export function withPendingEmailChange(
  prev: UserProfileResponse | null,
  newEmail: string,
): UserProfileResponse | null {
  if (!prev) return prev;
  return {
    ...prev,
    pendingEmailChange: {
      newEmail,
      expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS).toISOString(),
      requestedAt: new Date().toISOString(),
    },
  };
}

/** Read-only identity fields of the profile context. */
export function profileIdentity(profile: UserProfileResponse, userFallback: string) {
  const pendingNewEmail = pendingNewEmailOf(profile);
  return {
    displayName: profile.userName || profile.email || userFallback,
    avatarUrl: profile.avatar,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    isGoogleUser: profile.providers.includes(AuthProvider.GOOGLE),
    pendingEmailChange: pendingNewEmail ? { newEmail: pendingNewEmail } : null,
  };
}
