import type { AuthenticationResult } from "@/hooks/useAuthentication";
import { AccountRole, AuthProvider, type UserObject } from "@/types";
import { STORY_ACCOUNT_ID, STORY_USER_ID } from "./haiku";

export const STORY_LOGGED_IN_USER: UserObject = {
  id: STORY_USER_ID,
  email: "aristotle@example.com",
  userName: "Aristotle",
  firstName: "Aristotle",
  lastName: "",
  avatar:
    "https://cdn.britannica.com/84/87984-050-7C5547FE/Detail-Roman-copy-portrait-bust-Aristotle-Greek.jpg",
  avatarManuallySet: true,
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  providers: [AuthProvider.LOCAL],
};

export const STORY_LOGGED_IN_AUTH: AuthenticationResult = {
  initialized: true,
  isLoggedIn: true,
  user: STORY_LOGGED_IN_USER,
  account: [
    {
      membership: {
        id: "00000000-0000-4000-8000-000000000003",
        userId: STORY_USER_ID,
        accountId: STORY_ACCOUNT_ID,
        role: AccountRole.OWNER,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      account: {
        id: STORY_ACCOUNT_ID,
        name: "Aristotle's workspace",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    },
  ],
  logout: async () => undefined,
  checkAuthentication: () => undefined,
};
