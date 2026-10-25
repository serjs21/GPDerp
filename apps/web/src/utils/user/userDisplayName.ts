type DisplayNameSource = {
  /** The profile "nickname" (the account's unique username). */
  userName: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
};

/** Nickname when set, else first + last name, else email, else `fallback` (same order as share links). */
export function resolveUserDisplayName(user: DisplayNameSource, fallback: string): string {
  const nickname = user.userName?.trim();
  if (nickname) return nickname;
  const fullName = `${user.firstName?.trim() ?? ""} ${user.lastName?.trim() ?? ""}`.trim();
  return fullName || user.email || fallback;
}
