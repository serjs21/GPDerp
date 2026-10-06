import type { ReactNode } from "react";

export type PostcardPreviewProps = {
  /** Live 1200×800 side (PostcardRenderer or PostcardMessage). */
  children: ReactNode;
  /** Captures the same side offscreen as a PNG. */
  generate: () => Promise<Blob>;
  filename: string;
  /** Visual scale of the live renderer (layout size stays fixed). */
  scale?: number;
  label?: string;
};
