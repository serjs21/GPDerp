import { Avatar } from "@/components/StyledComponents";
import type { UserObject } from "@/types";
import styles from "./UserAvatar.module.css";

/** Fallback when the user has no Google/saved avatar URL. */
export const DEFAULT_USER_AVATAR_SRC = "/auth/default_avatar.svg";

export function resolveUserAvatarSrc(avatar?: string | null): string {
  const trimmed = avatar?.trim();
  return trimmed ? trimmed : DEFAULT_USER_AVATAR_SRC;
}

/** First letter of the user name, then email, as the image fallback. */
function userAvatarInitial(user: UserObject): string {
  return (user.userName?.slice(0, 1) ?? user.email?.slice(0, 1) ?? "?").toUpperCase();
}

export const UserAvatar = ({
  user,
  size = 36,
  fill = false,
  className,
}: {
  user: UserObject;
  size?: number;
  /** Stretch to fill the parent (e.g. comic label frame). */
  fill?: boolean;
  className?: string;
}) => {
  return (
    <Avatar
      shape="square"
      size={size}
      src={resolveUserAvatarSrc(user.avatar)}
      className={[fill && styles.fill, className].filter(Boolean).join(" ")}
    >
      {userAvatarInitial(user)}
    </Avatar>
  );
};
