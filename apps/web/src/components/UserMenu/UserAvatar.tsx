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
  /** Comic burst fill (default white; cream for header trigger chrome). */
  frameFill?: string;
};

/** Comic-burst framed avatar used as the UserMenu trigger (stays mounted on open). */
export function UserAvatar({
  user,
  label,
  className,
  size = USER_MENU_AVATAR_SIZE,
  frameFill,
}: UserAvatarProps) {
  return (
    <UserMenuBurstFrame
      label={label}
      className={className}
      size={size}
      fill={frameFill}
    >
      <AuthUserAvatar user={user} size={size} fill />
    </UserMenuBurstFrame>
  );
}
