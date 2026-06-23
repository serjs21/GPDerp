"use client";

import type { UserObject } from "@/types";
import { LoggedInUserMenuButton } from "./LoggedInUserMenuButton";

type LoggedInUserNavProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
};

export const LoggedInUserNav = ({ user, onLogout }: LoggedInUserNavProps) => (
  <LoggedInUserMenuButton user={user} onLogout={onLogout} />
);
