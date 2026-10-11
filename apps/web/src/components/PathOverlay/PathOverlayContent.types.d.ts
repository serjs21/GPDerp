import type { ReactNode } from "react";

export type PathOverlayContentProps = {
  open: boolean;
  reduceMotion: boolean | null;
  className: string;
  children?: ReactNode;
};
