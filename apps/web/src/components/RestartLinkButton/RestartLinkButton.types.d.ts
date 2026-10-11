import type { RestartLinkButtonAnimationRefs } from "./useRestartLinkButtonAnimation";

export type RestartLinkReason = "expired" | "limit_reached";

export type RestartLinkButtonProps = {
  reason: RestartLinkReason;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** Keep the hover lockup visible (Storybook / previews). */
  forceHover?: boolean;
  /** Banner left, as a percent of the expired emblem. Default 50. */
  reviveTextX?: number;
  /** Banner top, as a percent of the expired emblem. Default 80. */
  reviveTextY?: number;
  /** Banner rotation in degrees. Default -3. */
  reviveTextRotate?: number;
};

export type RestartCharLineProps = {
  text: string;
  className: string;
  lineRef: RestartLinkButtonAnimationRefs["idleChars"];
};

export type RestartHipointsMarkProps = {
  markRef: RestartLinkButtonAnimationRefs["hipoints"];
};

export type RestartReviveLockupProps = {
  lockupRef: RestartLinkButtonAnimationRefs["reviveLockup"];
  bannerRef: RestartLinkButtonAnimationRefs["reviveBanner"];
};

export type RestartButtonFaceProps = {
  reason: RestartLinkReason;
  showHipoints: boolean;
  idleFace: RestartLinkButtonAnimationRefs["idleFace"];
  idleChars: RestartLinkButtonAnimationRefs["idleChars"];
  hoverChars: RestartLinkButtonAnimationRefs["hoverChars"];
  hipoints: RestartLinkButtonAnimationRefs["hipoints"];
  filterIcon: RestartLinkButtonAnimationRefs["filterIcon"];
};
