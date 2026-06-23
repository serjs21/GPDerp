"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { HeaderPreferences } from "./HeaderPreferences";
import { LoggedInUserNav } from "./LoggedInUserNav";
import styles from "./style.module.css";

export const AuthNavigation = () => {
  const { initialized, isLoggedIn, user, logout } = useAuthenticationState();

  if (!initialized) return null;
  return (
    <div className={styles.authCluster}>
      <div className={styles.headerNavSlot}>
        {isLoggedIn ? <LoggedInUserNav user={user} onLogout={logout} /> : null}
      </div>
      <HeaderPreferences />
    </div>
  );
};
