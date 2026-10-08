"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { BrushMenu, type BrushMenuOption } from "@/components/BrushMenu";
import {
  GUEST_MENU_LABEL_KEY,
  GUEST_MENU_TRIGGER_SRC,
  USER_MENU_BURST_SEED_IDS,
  USER_MENU_GO_HOME,
  USER_MENU_LOGIN,
  USER_MENU_TRIGGER_FILL,
} from "./consts/userMenuConsts";
import type { GuestMenuProps } from "./GuestMenu.types";
import { UserMenuBurstFrame, USER_MENU_BURST_SIZE } from "./UserMenuBurstFrame";
import { GoHomeOptionLabel } from "./GoHomeOptionLabel";
import { goHomeOption, isMainPage } from "./utils/userMenuOptionUtils";
import frameStyles from "./UserMenuBurstFrame.module.css";
import styles from "./UserMenu.module.css";

/** Brush menu for logged-out visitors (share link page): Go home + Login. */
export function GuestMenu({ className }: GuestMenuProps) {
  const t = useTranslations("UserMenu");
  const guestLabel = t(GUEST_MENU_LABEL_KEY);
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthenticationModal } = useAuthenticationVerification();
  const onMainPage = isMainPage(pathname);

  const options = useMemo<BrushMenuOption[]>(
    () => [
      ...(onMainPage ? [] : [goHomeOption(t)]),
      {
        value: USER_MENU_LOGIN.value,
        label: <GoHomeOptionLabel text={t(USER_MENU_LOGIN.labelKey)} />,
        iconSrc: USER_MENU_LOGIN.backgroundSrc,
        className: styles.loginOption,
      },
    ],
    [onMainPage, t],
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
      expandLabel={guestLabel}
      options={options}
      placeholder={guestLabel}
      onChange={handleChange}
      renderTrigger={() => (
        <UserMenuBurstFrame
          label={guestLabel}
          seedId={USER_MENU_BURST_SEED_IDS.guest}
          fill={USER_MENU_TRIGGER_FILL}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG asset */}
          <img
            className={frameStyles.icon}
            src={GUEST_MENU_TRIGGER_SRC}
            alt=""
            width={USER_MENU_BURST_SIZE}
            height={USER_MENU_BURST_SIZE}
            draggable={false}
          />
        </UserMenuBurstFrame>
      )}
    />
  );
}
