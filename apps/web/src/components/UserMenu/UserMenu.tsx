"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import type { UserObject } from "@/types";
import {
  USER_MENU_BURST_SEED_IDS,
  USER_MENU_GO_HOME,
  USER_MENU_TRIGGER_FILL,
} from "./consts/userMenuConsts";
import { resolveUserDisplayName } from "@/utils/user/userDisplayName";
import { UserAvatar } from "./UserAvatar";
import { UserMenuOptionIconLabel } from "./UserMenuOptionIconLabel";
import { goHomeOption, isMainPage } from "./utils/userMenuOptionUtils";
import styles from "./UserMenu.module.css";

export type UserMenuProps = {
  user: UserObject;
  onLogout: () => void | Promise<void>;
  className?: string;
};

export function UserMenu({ user, onLogout, className }: UserMenuProps) {
  const t = useTranslations("UserMenu");
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthenticationModal } = useAuthenticationVerification();
  const onMainPage = isMainPage(pathname);
  const onSettingsPage = pathname.startsWith("/settings");
  const displayName = resolveUserDisplayName(user, t("fallbackName"));
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const options = useMemo<BrushMenuOption[]>(
    () => [
      ...(onMainPage ? [] : [goHomeOption(t)]),
      ...(onSettingsPage
        ? []
        : [
            {
              value: "settings",
              label: (
                <UserMenuOptionIconLabel
                  src="/nav/settings.svg"
                  iconLabel={t("settings")}
                  seedId={USER_MENU_BURST_SEED_IDS.settings}
                  text={t("settings")}
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
            iconLabel={t("logout")}
            seedId={USER_MENU_BURST_SEED_IDS.logout}
            text={t("logout")}
          />
        ),
        color: "rgb(255 110 110)",
        backgroundColor: "#0f8051",
      },
    ],
    [onMainPage, onSettingsPage, t],
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
        question={t("logoutQuestion")}
        cancelLabel={t("logoutCancel")}
        confirmLabel={t("logoutConfirm")}
        confirming={loggingOut}
        closeOnSelect={false}
        onConfirm={() => {
          void handleLogoutConfirm();
        }}
      />
    </>
  );
}
