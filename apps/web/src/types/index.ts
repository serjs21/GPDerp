// Frontend-facing types that mirror the API/DB models.
// Dates are represented as ISO strings because they come over JSON.

export enum AccountRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
}

export type UserObject = {
  id: string;
  email: string;
  userName: string | null;
  firstName: string;
  lastName: string;
  avatar: string;
  avatarManuallySet: boolean;
  emailVerifiedAt: string | null;
  // Present on `/auth/me` (derived from AuthIdentity rows).
  providers: AuthProvider[];
  // Present on `/auth/me` (count of completed generation purchases).
  purchasesCount: number;
};

export type AccountObject = {
  id: string;
  name: string;
  createdAt: string;
};

export type MembershipObject = {
  id: string;
  userId: string;
  accountId: string;
  role: AccountRole;
  createdAt: string;
};

// Composite type representing the user <-> account relationship.
export type AccountToUserObject = {
  membership: MembershipObject;
  account: AccountObject;
};

export type HaikuObject = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: string;
  accountId: string;
  createdById: string;
  // Not included by the current `/auth/me` endpoint; kept for future use.
  labels?: LabelObject[];
};

export type LabelObject = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  accountId: string;
};

