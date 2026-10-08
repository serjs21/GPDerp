"use client";

import { UserMenuBurstFrame, USER_MENU_BURST_SIZE } from "./UserMenuBurstFrame";
import type { UserMenuOptionIconLabelProps } from "./UserMenuOptionIconLabel.types";
import frameStyles from "./UserMenuBurstFrame.module.css";
import styles from "./UserMenu.module.css";

export function UserMenuOptionIconLabel({
  src,
  iconLabel,
  seedId,
  text,
  size = USER_MENU_BURST_SIZE,
}: UserMenuOptionIconLabelProps) {
  return (
    <span className={styles.optionLabel}>
      <UserMenuBurstFrame label={iconLabel} seedId={seedId} size={size}>
        {/* eslint-disable-next-line @next/next/no-img-element -- public SVG asset */}
        <img
          className={frameStyles.icon}
          src={src}
          alt=""
          width={size}
          height={size}
          draggable={false}
        />
      </UserMenuBurstFrame>
      <span className={styles.optionName}>{text}</span>
    </span>
  );
}
