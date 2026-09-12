"use client";

import type { UserObject } from "@/types";
import { UserMenu } from "@/components/UserMenu";

type LoggedInUserNavProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
};

export const LoggedInUserNav = ({ user, onLogout }: LoggedInUserNavProps) => (
  <UserMenu user={user} onLogout={onLogout} />
);
