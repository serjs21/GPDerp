"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import type { UserObject } from "@/types";
import { UserAvatar } from "@/components/AuthenticationNav/UserAvatar";
import styles from "./UserMenu.module.css";

const USER_MENU_AVATAR_SIZE = 36;

export type UserMenuProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
  className?: string;
};

function resolveDisplayName(user: UserObject) {
  return user.userName || user.email || "User";
}

export function UserMenu({ user, onLogout, className }: UserMenuProps) {
  const router = useRouter();
  const displayName = resolveDisplayName(user);
  const sharpShape = resolveComicLabelShapePreset("sharp");

  const options = useMemo<BrushMenuOption[]>(
    () => [
      {
        value: "profile",
        label: (
          <span className={styles.profileLabel}>
            <UserAvatar user={user} size={USER_MENU_AVATAR_SIZE} />
            <span className={styles.profileName}>{displayName}</span>
          </span>
        ),
      },
      { value: "buyGenerations", label: "Buy generations" },
      { value: "manageShareLinks", label: "Manage share links" },
      {
        value: "logout",
        label: "Logout",
        className: styles.logoutOption,
      },
    ],
    [displayName, user],
  );

  const handleChange = (key: string) => {
    switch (key) {
      case "profile":
        router.push("/profile");
        break;
      case "buyGenerations":
        router.push("/profile#buy-generations");
        break;
      case "manageShareLinks":
        router.push("/manage_share_links");
        break;
      case "logout":
        void onLogout();
        break;
      default:
        break;
    }
  };

  return (
    <BrushMenu
      className={className}
      triggerClassName={styles.trigger}
      options={options}
      placeholder={displayName}
      onChange={handleChange}
      renderTrigger={() => (
        <ComicBurstLabel
          className={styles.triggerBurst}
          text={displayName}
          shapeKind={sharpShape.kind}
          spikeCount={sharpShape.spikeCount}
          randomness={sharpShape.randomness}
          seed={sharpShape.id}
          fontSize={USER_MENU_AVATAR_SIZE}
          paddingX={0}
          paddingY={0}
          strokeWidth={3}
          fill="#ffffff"
        >
          <UserAvatar user={user} size={USER_MENU_AVATAR_SIZE} fill />
        </ComicBurstLabel>
      )}
    />
  );
}
