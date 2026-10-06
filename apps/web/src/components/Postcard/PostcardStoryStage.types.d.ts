import type { HaikuDto } from "@/api/haikus";
import type { PostcardPreviewProps } from "./PostcardPreview.types";

export type PostcardStoryStageProps = Pick<PostcardPreviewProps, "fontScale" | "scale"> & {
  slot: number;
  haiku: HaikuDto;
};
