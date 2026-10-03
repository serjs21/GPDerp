import type { ShareLinkSettingsControlsProps } from "./ShareLinkSettingsControls";

export type ShareLinkLifecycleActionProps = Pick<
  ShareLinkSettingsControlsProps,
  | "formValid"
  | "activating"
  | "deactivating"
  | "active"
  | "busy"
  | "isUpdating"
  | "busyDots"
  | "onStart"
  | "onStop"
  | "stopButtonClassName"
  | "restartReason"
> & {
  className?: string;
};
