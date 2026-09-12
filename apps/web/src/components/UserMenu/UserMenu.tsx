"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import type { UserObject } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { UserMenuBurstFrame } from "./UserMenuBurstFrame";
import frameStyles from "./UserMenuBurstFrame.module.css";
import styles from "./UserMenu.module.css";

export type UserMenuProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
  className?: string;
};

function resolveDisplayName(user: UserObject) {
  return user.userName || user.email || "User";
}

function OptionIconLabel({
  src,
  iconLabel,
  text,
}: {
  src: string;
  iconLabel: string;
  text: string;
}) {
  return (
    <span className={styles.optionLabel}>
      <UserMenuBurstFrame label={iconLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- public SVG asset */}
        <img
          className={frameStyles.icon}
          src={src}
          alt=""
          width={36}
          height={36}
          draggable={false}
        />
      </UserMenuBurstFrame>
      <span className={styles.optionName}>{text}</span>
    </span>
  );
}

export function UserMenu({ user, onLogout, className }: UserMenuProps) {
  const router = useRouter();
  const displayName = resolveDisplayName(user);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const options = useMemo<BrushMenuOption[]>(
    () => [
      {
        value: "settings",
        label: (
          <OptionIconLabel
            src="/settings.svg"
            iconLabel="Settings"
            text="Settings"
          />
        ),
      },
      {
        value: "logout",
        label: (
          <OptionIconLabel
            src="/logout.svg"
            iconLabel="Logout"
            text="Logout"
          />
        ),
        className: styles.logoutOption,
      },
    ],
    [],
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
        triggerBrush
        expandLabel={displayName}
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
        question="Did you have enough fun?"
        cancelLabel="Not yet"
        confirmLabel="Yes"
        confirming={loggingOut}
        closeOnSelect={false}
        onConfirm={() => {
          void handleLogoutConfirm();
        }}
      />
    </>
  );
}
