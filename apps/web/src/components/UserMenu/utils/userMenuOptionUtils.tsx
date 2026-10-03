import type { BrushMenuOption } from "@/components/BrushMenu";
import { USER_MENU_GO_HOME } from "../consts/userMenuConsts";
import { GoHomeOptionLabel } from "../GoHomeOptionLabel";
import styles from "../UserMenu.module.css";

export function isMainPage(pathname: string): boolean {
  return pathname === "/";
}

export function goHomeOption(): BrushMenuOption {
  return {
    value: USER_MENU_GO_HOME.value,
    label: <GoHomeOptionLabel text={USER_MENU_GO_HOME.label} />,
    iconSrc: USER_MENU_GO_HOME.backgroundSrc,
    className: styles.goHomeOption,
  };
}
