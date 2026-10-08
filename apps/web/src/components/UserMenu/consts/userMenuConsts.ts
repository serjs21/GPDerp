/** Arrow artwork painted as the row background (no burst icon). */
export const USER_MENU_GO_HOME = {
  value: "go-home",
  href: "/",
  backgroundSrc: "/nav/go_back_arrow.svg",
  labelKey: "goHome",
} as const;

export const USER_MENU_LOGIN = {
  value: "login",
  /** Go-home arrow, mirrored in CSS. */
  backgroundSrc: USER_MENU_GO_HOME.backgroundSrc,
  labelKey: "login",
} as const;

export const GUEST_MENU_TRIGGER_SRC = "/nav/default_login.svg";

export const GUEST_MENU_LABEL_KEY = "guest";

/** Untranslated burst shape seeds so shapes stay identical across locales. */
export const USER_MENU_BURST_SEED_IDS = {
  guest: "Guest",
  settings: "Settings",
  logout: "Logout",
} as const;

/** Cream burst fill matching header tool buttons / GoHome header chrome. */
export const USER_MENU_TRIGGER_FILL = "#f7f4ef";
