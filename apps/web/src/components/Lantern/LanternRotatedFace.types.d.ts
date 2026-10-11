import type { ReactNode } from "react";
import type { LanternRotatedShellProps } from "./LanternRotatedShell";

export type LanternRotatedFaceProps = Pick<LanternRotatedShellProps, "faceHalo" | "ariaLabel"> & {
  children: ReactNode;
};
