import type { ButtonHTMLAttributes } from "react";

export type OrderDropdownCoverProps = {
  /** Stage width (struck gavel + base) in rem; the raised gavel adds headroom around it. */
  widthRem?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};
