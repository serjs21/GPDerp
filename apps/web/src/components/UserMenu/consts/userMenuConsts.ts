/** Arrow artwork painted as the row background (no burst icon). */
export const USER_MENU_GO_HOME = {
  value: "go-home",
  href: "/",
  backgroundSrc: "/nav/go_back_arrow.svg",
  label: "Go home",
} as const;

export const USER_MENU_LOGIN = {
  value: "login",
  iconSrc: "/nav/login.svg",
  label: "Login",
  /** 4.5rem at the 16px root size. */
  iconSizePx: 72,
  iconFill: "#000000",
} as const;

export const GUEST_MENU_TRIGGER_SRC = "/nav/default_login.svg";

export const GUEST_MENU_LABEL = "Guest";

/** Cream burst fill matching SearchPanel / GoHome header chrome. */
export const USER_MENU_TRIGGER_FILL = "#f7f4ef";
