"use client";

import { Avatar, Button, Dropdown, type MenuProps, Space } from "antd";
import Link from "next/link";
import type { UserObject } from "@/types";
import styles from "./style.module.css";
import "@/css/text.css";

type LoggedInUserDropdownProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
};


const UserIdDisplay = ({ user }: { user: UserObject }) => {
  return (
    <Space>
      <Avatar shape="square" size={36} src={user.avatar || undefined}>
        {user.userName.slice(0, 1).toUpperCase()}
      </Avatar>
    </Space>
  )
}

export const LoggedInUserDropdown = ({ user, onLogout }: LoggedInUserDropdownProps) => {
  const displayName = user.userName || user.email || "User";

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (<Link href="/profile"><div className={styles.userDropdownItem}>
      <UserIdDisplay user={user} /> <span className={styles.userDropdownLink}>{displayName}</span>
    </div>
  </Link>),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      danger: true,
    },
  ];

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      void onLogout();
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomLeft"
      menu={{ items, onClick: onMenuClick }}
    >
      <Button type="text" className={styles.userDropdownTrigger}>
        <UserIdDisplay user={user} />
      </Button>
    </Dropdown>
  );
};
