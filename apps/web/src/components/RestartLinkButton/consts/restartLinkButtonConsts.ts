import type { RestartLinkReason } from "../RestartLinkButton.types";

export const FILTER_ICON_SRC: Record<RestartLinkReason, string> = {
  expired: "/share_links_filter/expired.svg",
  limit_reached: "/share_links_filter/limit_reached.svg",
};

export const IDLE_LABEL: Record<RestartLinkReason, string> = {
  expired: "expired",
  limit_reached: "limitReached",
};

export const HOVER_LABEL: Record<RestartLinkReason, string> = {
  expired: "revive",
  limit_reached: "resurrect",
};

export const HIPOINTS_SRC = "/profile/re-hipoints.svg";
export const RE_EXPIRED_SRC = "/profile/re-expired.svg";

export const RESTART_LINK_BUTTON_DEFAULTS = {
  disabled: false,
  forceHover: false,
  reviveTextX: 50,
  reviveTextY: 80,
  reviveTextRotate: -3,
};
