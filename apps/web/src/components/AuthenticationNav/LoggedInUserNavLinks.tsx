"use client";

import Link from "next/link";
import { Button } from "@/components/StyledComponents";
import type { UserObject } from "@/types";
import { UserAvatar } from "./UserAvatar";
import styles from "./loggedInUserNav.module.css";

type LoggedInUserNavLinksProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
};

export const LoggedInUserNavLinks = ({ user, onLogout }: LoggedInUserNavLinksProps) => {
  const displayName = user.userName || user.email || "User";

  return (
    <nav className={styles.desktopNav} aria-label="Account">
      <Link href="/profile" className={styles.navLink}>
        <UserAvatar user={user} />
        <span className={styles.navLinkLabel}>{displayName}</span>
      </Link>
      <Link href="/manage_labels" className={styles.navLink}>
        Manage labels
      </Link>
      <Link href="/manage_share_links" className={styles.navLink}>
        Manage share links
      </Link>
      <Button type="text" danger className={styles.logoutButton} onClick={() => void onLogout()}>
        Logout
      </Button>
    </nav>
  );
};
