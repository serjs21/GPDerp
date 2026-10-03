"use client";

import { UserMenuBurstFrame } from "./UserMenuBurstFrame";
import type { UserMenuOptionIconLabelProps } from "./UserMenuOptionIconLabel.types";
import frameStyles from "./UserMenuBurstFrame.module.css";
import styles from "./UserMenu.module.css";

export function UserMenuOptionIconLabel({ src, iconLabel, text }: UserMenuOptionIconLabelProps) {
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
