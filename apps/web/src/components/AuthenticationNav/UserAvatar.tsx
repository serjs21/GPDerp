import { Avatar, Space } from "@/components/StyledComponents";
import type { UserObject } from "@/types";

export const UserAvatar = ({ user }: { user: UserObject }) => {
  const initial = (user.userName?.slice(0, 1) ?? user.email?.slice(0, 1) ?? "?").toUpperCase();
  return (
    <Space>
      <Avatar shape="square" size={36} src={user.avatar || undefined}>
        {initial}
      </Avatar>
    </Space>
  );
};
