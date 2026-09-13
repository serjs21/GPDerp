"use client";

import { Button, Dropdown, type MenuProps } from "@/components/StyledComponents";
import Link from "next/link";
import type { UserObject } from "@/types";
import { UserAvatar } from "./UserAvatar";
import styles from "./loggedInUserNav.module.css";
import navStyles from "./style.module.css";

type LoggedInUserMenuButtonProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
};

export const LoggedInUserMenuButton = ({ user, onLogout }: LoggedInUserMenuButtonProps) => {
  const displayName = user.userName || user.email || "User";

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <Link href="/settings">
          <div className={navStyles.userDropdownItem}>
            <UserAvatar user={user} />
            <span className={navStyles.userDropdownLink}>{displayName}</span>
          </div>
        </Link>
      ),
    },
    {
      key: "buyGenerations",
      label: (
        <Link href="/settings?tab=tokens">
          <div className={navStyles.userDropdownItem}>Buy generations</div>
        </Link>
      ),
    },
    {
      key: "manageShareLinks",
      label: (
        <Link href="/settings?tab=share-links">
          <div className={navStyles.userDropdownItem}>Manage share links</div>
        </Link>
      ),
    },
    { type: "divider" },
    { key: "logout", label: "Logout", danger: true },
  ];

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") void onLogout();
  };

  return (
    <Dropdown trigger={["click"]} placement="bottomLeft" menu={{ items, onClick: onMenuClick }}>
      <Button type="text" className={`${navStyles.userDropdownTrigger} ${styles.mobileMenuButton}`}>
        <UserAvatar user={user} />
      </Button>
    </Dropdown>
  );
};
