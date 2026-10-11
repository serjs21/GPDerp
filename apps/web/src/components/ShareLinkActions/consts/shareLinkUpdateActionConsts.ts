import type { TransitionPose } from "@/components/animations/SteppedTransition";
import type { ComicPanelColor } from "@/components/ComicPageLayout";
import type { CalloutPosition } from "@/components/HoverHoldCallout";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

export const SHARE_LINK_UPDATE_ICONS = {
  enabled: "/share_link_actions/update.svg",
  disabled: "/share_link_actions/update_disabled.svg",
  notStarted: "/share_link_actions/not_started.svg",
} as const;

/** Not-started → started wake-up frames, in play order. */
export const SHARE_LINK_WAKE_FRAMES = [
  SHARE_LINK_UPDATE_ICONS.notStarted,
  "/share_link_actions/wake_1.svg",
  "/share_link_actions/wake_2.svg",
  SHARE_LINK_UPDATE_ICONS.disabled,
] as const;

/** One stepped pose per frame; `progress` encodes the frame index. */
export const SHARE_LINK_WAKE_POSES: TransitionPose[] = SHARE_LINK_WAKE_FRAMES.map((_, index) => ({
  progress: index / (SHARE_LINK_WAKE_FRAMES.length - 1),
  x: 0,
  y: 0,
  rotation: 0,
}));

export const SHARE_LINK_WAKE_TIMING = {
  holdMs: 320,
  crossfadeMs: 90,
} as const;

export const SHARE_LINK_UPDATE_COLORS = {
  panel: "#fbffd7",
  /** Sunburst ray color. */
  accent: "#f1e98f",
  hover: "#f0ff6b",
} as const satisfies { panel: ComicPanelColor; accent: string; hover: string };

export const SHARE_LINK_UPDATE_LAYOUT = {
  icon: { size: "100%", top: "0rem", left: "0rem", rotateDeg: 0 },
  caption: { bottom: "1rem", right: "0", rotateDeg: 0, fontSize: "1.2rem", width: "100%", textAlign: "center" },
} as const satisfies ShareLinkActionLayout;

export const SHARE_LINK_UPDATE_DISABLED_MESSAGE_KEYS = {
  inactive: "disabledInactive",
  unchanged: "disabledUnchanged",
} as const;

/** Bubble floats to the right of the Update panel (mirror of Tune in's left callout). */
export const SHARE_LINK_UPDATE_CALLOUT_POSITION = {
  right: "calc(70% + 0.6rem)",
  bottom: "30%",
} as const satisfies CalloutPosition;

/** Bubble placement for the not-started (inactive link) variation. */
export const SHARE_LINK_UPDATE_NOT_STARTED_CALLOUT_POSITION = {
  right: "calc(100% + 0.6rem)",
  bottom: "10%",
} as const satisfies CalloutPosition;

export const SHARE_LINK_UPDATE_CALLOUT_TIMING = {
  holdMs: 3000,
  fadeMs: 200,
} as const;
