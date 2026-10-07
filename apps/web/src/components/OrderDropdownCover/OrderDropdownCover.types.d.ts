import type { ButtonHTMLAttributes } from "react";

type ButtonAttrs = ButtonHTMLAttributes<HTMLButtonElement>;

export type OrderDropdownCoverProps = {
  /** Stage width (struck gavel + base) in rem; the raised gavel adds headroom around it. */
  widthRem?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-expanded"?: ButtonAttrs["aria-expanded"];
  "aria-controls"?: ButtonAttrs["aria-controls"];
  "aria-haspopup"?: ButtonAttrs["aria-haspopup"];
  onClick?: ButtonAttrs["onClick"];
};
