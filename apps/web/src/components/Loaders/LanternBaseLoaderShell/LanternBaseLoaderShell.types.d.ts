import type { ReactNode } from "react";

/** Size it with `--lantern-loader-width` (any length, % included) on the className or an ancestor. */
export type LanternBaseLoaderShellProps = {
  className?: string;
  /** Loader drawn on the lantern's front panel; the panel is a positioned box it can fill. */
  children: ReactNode;
};
