"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Card, Descriptions, Space, Typography } from "antd";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { initialized, isLoggedIn, user } = useAuthenticationState();

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) router.replace("/");
  }, [initialized, isLoggedIn, router]);

  if (!initialized || !isLoggedIn) return null;

  const displayName = user.userName || user.email || "User";

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        maxWidth: 720,
        margin: "24px auto",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <Card title="Profile">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Space size={12}>
            <Avatar shape="square" size={36} src={user.avatar || undefined}>
              {displayName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {displayName}
            </Typography.Title>
          </Space>

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Username">{user.userName || "-"}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="First name">{user.firstName || "-"}</Descriptions.Item>
            <Descriptions.Item label="Last name">{user.lastName || "-"}</Descriptions.Item>
            <Descriptions.Item label="Email verified">{user.emailVerifiedAt ? "Yes" : "No"}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </main>
  );
}
