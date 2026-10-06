import type { HaikuDto } from "@/api/haikus";
import type { PostcardPreviewProps } from "./PostcardPreview.types";
import type { PostcardRendererProps } from "./PostcardRenderer.types";

export type PostcardStoryStageProps = Pick<PostcardPreviewProps, "scale"> &
  Pick<PostcardRendererProps, "fontScale"> & {
    slot: number;
    haiku: HaikuDto;
  };
