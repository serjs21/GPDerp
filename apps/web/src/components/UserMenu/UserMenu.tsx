"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import type { UserObject } from "@/types";
import { UserAvatar } from "./UserAvatar";
import styles from "./UserMenu.module.css";

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
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const options = useMemo<BrushMenuOption[]>(
    () => [
      {
        value: "profile",
        displayOnly: true,
        label: (
          <span className={styles.profileLabel}>
            <UserAvatar user={user} label={displayName} />
            <span className={styles.profileName}>{displayName}</span>
          </span>
        ),
      },
      {
        value: "settings",
        label: (
          <span className={styles.settingsLabel}>
            {/* eslint-disable-next-line @next/next/no-img-element -- public SVG asset */}
            <img
              className={styles.settingsIcon}
              src="/settings.svg"
              alt=""
              width={28}
              height={28}
              draggable={false}
            />
            Settings
          </span>
        ),
      },
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
      case "settings":
        router.push("/profile");
        break;
      case "logout":
        setLogoutOpen(true);
        break;
      default:
        break;
    }
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <>
      <BrushMenu
        className={className}
        triggerClassName={styles.trigger}
        options={options}
        placeholder={displayName}
        onChange={handleChange}
        renderTrigger={() => (
          <UserAvatar user={user} label={displayName} />
        )}
      />

      <ComicConfirmModal
        open={logoutOpen}
        onOpenChange={(open) => {
          if (loggingOut) return;
          setLogoutOpen(open);
        }}
        question="Log out of Indra's Nest?"
        cancelLabel="Stay"
        confirmLabel="Log out"
        confirming={loggingOut}
        closeOnSelect={false}
        onConfirm={() => {
          void handleLogoutConfirm();
        }}
      />
    </>
  );
}
