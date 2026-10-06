import type { PostcardMessageProps } from "./PostcardMessage.types";
import type { PostcardPreviewProps } from "./PostcardPreview.types";

export type PostcardMessageStoryStageProps = Pick<PostcardPreviewProps, "scale"> &
  Pick<PostcardMessageProps, "message" | "senderName" | "recipient">;
