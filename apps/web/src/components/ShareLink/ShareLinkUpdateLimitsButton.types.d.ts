import type { ShareLinkSettingsControlsProps } from "./ShareLinkSettingsControls";

export type ShareLinkUpdateLimitsButtonProps = Pick<
  ShareLinkSettingsControlsProps,
  "updatingLimits" | "busyDots" | "onUpdateLimits" | "formValid" | "isUpdating" | "busy"
>;
