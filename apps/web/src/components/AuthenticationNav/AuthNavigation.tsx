"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { LoggedOutAuthLinks } from "./LoggedOutAuthLinks";
import { LoggedInUserDropdown } from "./LoggedInUserDropdown";

export const AuthNavigation = () => {
  const { initialized, isLoggedIn, user, logout } = useAuthenticationState();

  if (!initialized) return null;
  if (!isLoggedIn) return <LoggedOutAuthLinks />;
  return <LoggedInUserDropdown user={user} onLogout={logout} />;
};
