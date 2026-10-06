import { generatePostcardImage, type GeneratePostcardImageInput } from "./generatePostcardImage";
import {
  generatePostcardMessageImage,
  type GeneratePostcardMessageImageInput,
} from "./generatePostcardMessageImage";

export type GeneratePostcardImagesInput = Omit<GeneratePostcardImageInput, "fontScale"> &
  Omit<GeneratePostcardMessageImageInput, "recipient"> & {
    recipients: string[];
  };

export type PostcardBackImage = { recipient: string; blob: Blob };

/** One shared front; one back per recipient (in `recipients` order) addressed only to them. */
export type PostcardImages = { front: Blob; backs: PostcardBackImage[] };

async function pngSize(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

async function assertSameSize(front: Blob, back: PostcardBackImage): Promise<void> {
  const [frontSize, backSize] = await Promise.all([pngSize(front), pngSize(back.blob)]);
  if (frontSize.width !== backSize.width || frontSize.height !== backSize.height) {
    throw new Error(
      `Postcard sides differ in size (front ${frontSize.width}×${frontSize.height}, back for ${back.recipient} ${backSize.width}×${backSize.height})`,
    );
  }
}

/** Generate the front and every recipient's back; rejects unless all have identical pixel dimensions. */
export async function generatePostcardImages({
  theme,
  haiku,
  message,
  senderName,
  recipients,
}: GeneratePostcardImagesInput): Promise<PostcardImages> {
  if (recipients.length === 0) throw new Error("A postcard needs at least one recipient");
  const front = await generatePostcardImage({ theme, haiku });
  const backs: PostcardBackImage[] = [];
  for (const recipient of recipients) {
    const blob = await generatePostcardMessageImage({ message, senderName, recipient });
    backs.push({ recipient, blob });
  }
  await Promise.all(backs.map((back) => assertSameSize(front, back)));
  return { front, backs };
}
