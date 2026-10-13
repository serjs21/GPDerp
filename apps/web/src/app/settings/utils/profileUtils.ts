import type { UserProfileResponse } from "@/api/user";

/** Settings render only for a signed-in user once the profile request settled. */
export function isProfilePageReady(initialized: boolean, isLoggedIn: boolean, loading: boolean): boolean {
  return initialized && isLoggedIn && !loading;
}

/** Read-only identity fields of the profile context. */
export function profileIdentity(profile: UserProfileResponse, userFallback: string) {
  return {
    displayName: profile.userName || profile.email || userFallback,
    avatarUrl: profile.avatar,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
  };
}
