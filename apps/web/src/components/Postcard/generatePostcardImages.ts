import { generatePostcardImage, type GeneratePostcardImageInput } from "./generatePostcardImage";
import {
  generatePostcardMessageImage,
  type GeneratePostcardMessageImageInput,
} from "./generatePostcardMessageImage";

export type GeneratePostcardImagesInput = Omit<GeneratePostcardImageInput, "fontScale"> &
  Omit<GeneratePostcardMessageImageInput, "theme">;

export type PostcardImages = { front: Blob; back: Blob };

async function pngSize(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

/** Generate both postcard sides; rejects unless they have identical pixel dimensions. */
export async function generatePostcardImages({
  theme,
  haiku,
  message,
  senderName,
  recipients,
}: GeneratePostcardImagesInput): Promise<PostcardImages> {
  const front = await generatePostcardImage({ theme, haiku });
  const back = await generatePostcardMessageImage({ theme, message, senderName, recipients });

  const [frontSize, backSize] = await Promise.all([pngSize(front), pngSize(back)]);
  if (frontSize.width !== backSize.width || frontSize.height !== backSize.height) {
    throw new Error(
      `Postcard sides differ in size (front ${frontSize.width}×${frontSize.height}, back ${backSize.width}×${backSize.height})`,
    );
  }
  return { front, back };
}
