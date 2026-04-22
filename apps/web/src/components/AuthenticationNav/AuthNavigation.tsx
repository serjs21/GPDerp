"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { HeaderPreferences } from "./HeaderPreferences";
import { LoggedOutAuthLinks } from "./LoggedOutAuthLinks";
import { LoggedInUserDropdown } from "./LoggedInUserDropdown";
import styles from "./style.module.css";

export const AuthNavigation = () => {
  const { initialized, isLoggedIn, user, logout } = useAuthenticationState();

  if (!initialized) return null;
  return (
    <div className={styles.authCluster}>
      <HeaderPreferences />
      {isLoggedIn ? <LoggedInUserDropdown user={user} onLogout={logout} /> : <LoggedOutAuthLinks />}
    </div>
  );
};
