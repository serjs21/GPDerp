"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { GoHome } from "@/components/GoHome";
import { SearchPanel } from "@/components/HeaderHaikuTools";
import { HeaderPreferences } from "./HeaderPreferences";
import { LoggedInUserNav } from "./LoggedInUserNav";
import styles from "./style.module.css";
import toolStyles from "@/components/HeaderHaikuTools/HeaderHaikuTools.module.css";

export const AuthNavigation = () => {
  const { initialized, isLoggedIn, user, logout } = useAuthenticationState();

  if (!initialized) return null;
  return (
    <div className={styles.authCluster}>
      <div className={styles.headerNavSlot}>
        {isLoggedIn ? (
          <div className={toolStyles.toolsSlot}>
            <LoggedInUserNav user={user} onLogout={logout} />
            <GoHome />
            <SearchPanel />
          </div>
        ) : null}
      </div>
      <HeaderPreferences />
    </div>
  );
};
