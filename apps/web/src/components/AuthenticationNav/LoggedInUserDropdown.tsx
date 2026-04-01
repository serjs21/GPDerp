"use client";

import { Avatar, Button, Dropdown, type MenuProps, Space } from "antd";
import Link from "next/link";
import { DownOutlined } from "@ant-design/icons";
import type { UserObject } from "@/types";

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
      <span>{user.userName}</span>
    </Space>
  )
}

export const LoggedInUserDropdown = ({ user, onLogout }: LoggedInUserDropdownProps) => {
  const displayName = user.userName || user.email || "User";

  const items: MenuProps["items"] = [
    {
      key: "identity",
      disabled: true,
      label: (
        <Space size={10}>
          <Avatar shape="square" size={36} src={user.avatar || undefined}>
            {displayName.slice(0, 1).toUpperCase()}
          </Avatar>
          <span>{displayName}</span>
        </Space>
      ),
    },
    {
      key: "profile",
      label: <Link href="/profile">Profile</Link>,
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
      menu={{ items, onClick: onMenuClick }}
    >
      <Button type="text" style={{ width: 'fit-content' }}>
        <UserIdDisplay user={user} />
      </Button>
    </Dropdown>
  );
};
