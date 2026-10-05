"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import {
  GUEST_MENU_LABEL,
  GUEST_MENU_TRIGGER_SRC,
  USER_MENU_GO_HOME,
  USER_MENU_LOGIN,
  USER_MENU_TRIGGER_FILL,
} from "./consts/userMenuConsts";
import type { GuestMenuProps } from "./GuestMenu.types";
import { UserMenuBurstFrame } from "./UserMenuBurstFrame";
import { UserMenuOptionIconLabel } from "./UserMenuOptionIconLabel";
import { goHomeOption, isMainPage } from "./utils/userMenuOptionUtils";
import frameStyles from "./UserMenuBurstFrame.module.css";
import styles from "./UserMenu.module.css";

/** Brush menu for logged-out visitors (share link page): Go home + Login. */
export function GuestMenu({ className }: GuestMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthenticationModal } = useAuthenticationVerification();
  const onMainPage = isMainPage(pathname);

  const options = useMemo<BrushMenuOption[]>(
    () => [
      ...(onMainPage ? [] : [goHomeOption()]),
      {
        value: USER_MENU_LOGIN.value,
        label: (
          <UserMenuOptionIconLabel
            src={USER_MENU_LOGIN.iconSrc}
            iconLabel={USER_MENU_LOGIN.label}
            text={USER_MENU_LOGIN.label}
            size={USER_MENU_LOGIN.iconSizePx}
          />
        ),
        backgroundColor: USER_MENU_LOGIN.iconFill,
        iconSrc: USER_MENU_LOGIN.backgroundSrc,
        className: styles.loginOption,
      },
    ],
    [onMainPage],
  );

  const handleChange = (key: string) => {
    switch (key) {
      case USER_MENU_GO_HOME.value:
        router.push(USER_MENU_GO_HOME.href);
        break;
      case USER_MENU_LOGIN.value:
        openAuthenticationModal("login");
        break;
      default:
        break;
    }
  };

  return (
    <BrushMenu
      className={className}
      triggerClassName={styles.trigger}
      triggerBrush
      expandLabel={GUEST_MENU_LABEL}
      options={options}
      placeholder={GUEST_MENU_LABEL}
      onChange={handleChange}
      renderTrigger={() => (
        <UserMenuBurstFrame label={GUEST_MENU_LABEL} fill={USER_MENU_TRIGGER_FILL}>
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG asset */}
          <img
            className={frameStyles.icon}
            src={GUEST_MENU_TRIGGER_SRC}
            alt=""
            width={36}
            height={36}
            draggable={false}
          />
        </UserMenuBurstFrame>
      )}
    />
  );
}
