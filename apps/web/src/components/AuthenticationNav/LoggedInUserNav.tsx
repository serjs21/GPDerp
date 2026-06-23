"use client";

import type { UserObject } from "@/types";
import { LoggedInUserMenuButton } from "./LoggedInUserMenuButton";
import { LoggedInUserNavLinks } from "./LoggedInUserNavLinks";
import styles from "./loggedInUserNav.module.css";

type LoggedInUserNavProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
};

export const LoggedInUserNav = ({ user, onLogout }: LoggedInUserNavProps) => (
  <div className={styles.wrap}>
    <LoggedInUserNavLinks user={user} onLogout={onLogout} />
    <LoggedInUserMenuButton user={user} onLogout={onLogout} />
  </div>
);
