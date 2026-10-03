import type { UserMenuBurstFrameProps } from "./UserMenuBurstFrame";

export type UserMenuOptionIconLabelProps = {
  src: string;
  /** Burst seed / a11y context text. */
  iconLabel: string;
  text: string;
  /** Burst + icon box (px); defaults to the 36px trigger size. */
  size?: UserMenuBurstFrameProps["size"];
};
