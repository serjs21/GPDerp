"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { UserAvatar as AuthUserAvatar } from "@/components/AuthenticationNav/UserAvatar";
import type { UserObject } from "@/types";
import styles from "./UserAvatar.module.css";

export const USER_MENU_AVATAR_SIZE = 36;

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
  const sharpShape = resolveComicLabelShapePreset("sharp");

  return (
    <ComicBurstLabel
      className={`${styles.burst}${className ? ` ${className}` : ""}`}
      text={label}
      shapeKind={sharpShape.kind}
      spikeCount={sharpShape.spikeCount}
      randomness={sharpShape.randomness}
      seed={sharpShape.id}
      fontSize={size}
      paddingX={0}
      paddingY={0}
      strokeWidth={3}
      fill="#ffffff"
    >
      <AuthUserAvatar user={user} size={size} fill />
    </ComicBurstLabel>
  );
}
