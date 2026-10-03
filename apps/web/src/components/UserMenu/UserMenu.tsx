"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import type { UserObject } from "@/types";
import { USER_MENU_GO_HOME, USER_MENU_TRIGGER_FILL } from "./consts/userMenuConsts";
import { UserAvatar } from "./UserAvatar";
import { UserMenuOptionIconLabel } from "./UserMenuOptionIconLabel";
import { goHomeOption, isMainPage } from "./utils/userMenuOptionUtils";
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
  const pathname = usePathname();
  const { openAuthenticationModal } = useAuthenticationVerification();
  const onMainPage = isMainPage(pathname);
  const onSettingsPage = pathname.startsWith("/settings");
  const displayName = resolveDisplayName(user);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const options = useMemo<BrushMenuOption[]>(
    () => [
      ...(onMainPage ? [] : [goHomeOption()]),
      ...(onSettingsPage
        ? []
        : [
            {
              value: "settings",
              label: (
                <UserMenuOptionIconLabel
                  src="/nav/settings.svg"
                  iconLabel="Settings"
                  text="Settings"
                />
              ),
              backgroundColor: "#1ac3b0",
            },
          ]),
      {
        value: "logout",
        label: (
          <UserMenuOptionIconLabel
            src="/auth/logout.svg"
            iconLabel="Logout"
            text="Logout"
          />
        ),
        color: "rgb(255 110 110)",
        backgroundColor: "#0f8051",
      },
    ],
    [onMainPage, onSettingsPage],
  );

  const handleChange = (key: string) => {
    switch (key) {
      case "settings":
        router.push("/settings");
        break;
      case USER_MENU_GO_HOME.value:
        router.push(USER_MENU_GO_HOME.href);
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
      openAuthenticationModal("login");
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
          <UserAvatar
            user={user}
            label={displayName}
            frameFill={USER_MENU_TRIGGER_FILL}
          />
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
