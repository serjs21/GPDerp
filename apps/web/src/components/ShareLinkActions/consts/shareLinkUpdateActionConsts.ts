import type { TransitionPose } from "@/components/animations/SteppedTransition";
import type { ComicPanelColor } from "@/components/ComicPageLayout";
import type { CalloutPosition } from "@/components/HoverHoldCallout";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";
import type { ShareLinkWakeSegment } from "../ShareLinkWakeTransition.types";

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


const SHARE_LINK_WAKE_SEGMENT_FRAMES: Record<ShareLinkWakeSegment, readonly number[]> = {
  waking: [0, 1],
  wakeConfirmed: [1, 2, 3],
  wakeFailed: [1, 0],
  sleeping: [3, 2],
  sleepConfirmed: [2, 1, 0],
  sleepFailed: [2, 3],
};

export const SHARE_LINK_WAKE_SEGMENT_POSES = Object.fromEntries(
  Object.entries(SHARE_LINK_WAKE_SEGMENT_FRAMES).map(([segment, frames]) => [
    segment,
    frames.map(
      (frame): TransitionPose => ({
        progress: frame / (SHARE_LINK_WAKE_FRAMES.length - 1),
        x: 0,
        y: 0,
        rotation: 0,
      }),
    ),
  ]),
) as Record<ShareLinkWakeSegment, TransitionPose[]>;

export const SHARE_LINK_WAKE_TERMINAL_ACTIVE: Partial<Record<ShareLinkWakeSegment, boolean>> = {
  wakeConfirmed: true,
  wakeFailed: false,
  sleepConfirmed: false,
  sleepFailed: true,
};

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

export const SHARE_LINK_UPDATE_CALLOUT_POSITION = {
  right: "calc(90% + 0.6rem)",
  bottom: "30%",
} as const satisfies CalloutPosition;

export const SHARE_LINK_UPDATE_NOT_STARTED_CALLOUT_POSITION = {
  right: "calc(90% + 0.6rem)",
  bottom: "10%",
} as const satisfies CalloutPosition;

export const SHARE_LINK_UPDATE_UNAVAILABLE_VARIANTS = {
  unchanged: {
    messageKey: SHARE_LINK_UPDATE_DISABLED_MESSAGE_KEYS.unchanged,
    position: SHARE_LINK_UPDATE_CALLOUT_POSITION,
    icon: SHARE_LINK_UPDATE_ICONS.disabled,
    bubbleClass: "speechBubble",
    slotClass: "speechBubbleSlot",
  },
  inactive: {
    messageKey: SHARE_LINK_UPDATE_DISABLED_MESSAGE_KEYS.inactive,
    position: SHARE_LINK_UPDATE_NOT_STARTED_CALLOUT_POSITION,
    icon: SHARE_LINK_UPDATE_ICONS.notStarted,
    bubbleClass: "notStartedBubble",
    slotClass: "notStartedBubbleSlot",
  },
} as const;

export const SHARE_LINK_UPDATE_CALLOUT_TIMING = {
  holdMs: 3000,
  fadeMs: 200,
} as const;
