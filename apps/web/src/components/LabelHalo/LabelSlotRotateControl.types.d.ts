import type { ButtonHTMLAttributes } from "react";

export type LabelSlotRotateControlProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
> & {
  /** Control is shown (and tabbable unless disabled). */
  visible: boolean;
  disabled: boolean;
};
