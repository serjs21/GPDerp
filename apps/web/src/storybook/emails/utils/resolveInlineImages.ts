import { DEV_API_PREFIX, type DevEmailInlineImage } from "../devEmails";

function inlineImageUrl(image: DevEmailInlineImage, postcardFrontUrl: string | null): string | null {
  if (image.kind === "postcardBack") return `${DEV_API_PREFIX}${image.path}`;
  return postcardFrontUrl;
}

/**
 * Swap `src="cid:…"` references for URLs, the way Gmail shows inline attachments.
 * An image whose URL is not ready yet keeps its `cid:` source (a broken image, as in a mail client).
 */
export function resolveInlineImages(
  html: string,
  images: DevEmailInlineImage[],
  postcardFrontUrl: string | null,
): string {
  return images.reduce((result, image) => {
    const url = inlineImageUrl(image, postcardFrontUrl);
    return url ? result.split(`src="cid:${image.cid}"`).join(`src="${url}"`) : result;
  }, html);
}
