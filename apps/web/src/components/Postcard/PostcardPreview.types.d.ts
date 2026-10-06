import type { PostcardRendererProps } from "./PostcardRenderer.types";

export type PostcardPreviewProps = Pick<PostcardRendererProps, "theme" | "haiku" | "fontScale"> & {
  /** Visual scale of the live 1200×800 renderer (layout size stays fixed). */
  scale?: number;
};
