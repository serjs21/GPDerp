import type { LabelActionButtonProps } from "./LabelActionButton.types";

export type LabelActionIconProps = Pick<LabelActionButtonProps, "src" | "iconClassName"> & {
  inkOnSky: boolean;
};
