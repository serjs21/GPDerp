"use client";

import { UserAvatar as AuthUserAvatar } from "@/components/AuthenticationNav/UserAvatar";
import type { UserObject } from "@/types";
import {
  UserMenuBurstFrame,
  USER_MENU_BURST_SIZE,
} from "./UserMenuBurstFrame";

export const USER_MENU_AVATAR_SIZE = USER_MENU_BURST_SIZE;

export type UserAvatarProps = {
  user: UserObject;
  /** Burst label text (also used for shape seed context). */
  label: string;
  className?: string;
  size?: number;
};

/** Comic-burst framed avatar used in the UserMenu trigger and profile row. */
export function UserAvatar({
  user,
  label,
  className,
  size = USER_MENU_AVATAR_SIZE,
}: UserAvatarProps) {
  return (
    <UserMenuBurstFrame label={label} className={className} size={size}>
      <AuthUserAvatar user={user} size={size} fill />
    </UserMenuBurstFrame>
  );
}
