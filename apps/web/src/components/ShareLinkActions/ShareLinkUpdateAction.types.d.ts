import type { ShareLinkWakeSegment } from "./ShareLinkWakeTransition.types";

export type ShareLinkUpdateActionProps = {
  /** Haiku subject, used in accessible labels. */
  subject: string;
  /** Update is disabled while the share link is not active. */
  active: boolean;
  /** Limits differ from the saved link and are valid. */
  canUpdate: boolean;
  updating: boolean;
  onUpdate: () => void;
  /** Start/stop wake animation in progress; replaces the panel while set. */
  wakeSegment?: ShareLinkWakeSegment | null;
  onWakeAnimationEnd?: () => void;
};
