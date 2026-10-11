import type { ReactNode } from "react";

export type PuffInWrapProps = {
  /** When set, plays the magictime puffIn after this delay (ms); undefined renders a plain wrapper. */
  delayMs?: number;
  onPuffEnd?: () => void;
  children: ReactNode;
};
