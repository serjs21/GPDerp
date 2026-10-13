export const ICON_UPLOAD_DEFAULTS = {
  allowedInputMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"] as const,
  maxInputFileSizeBytes: 15 * 1024 * 1024,
  maxOutputFileSizeBytes: 2 * 1024 * 1024,
  preferredTargetSizeBytes: 1 * 1024 * 1024,
  /** Saved size, not an input limit: avatars display at most ~86 CSS px, so 256 covers 3x screens. */
  maxWidth: 256,
  maxHeight: 256,
  minDimension: 64,
};

export type ProcessedImageForUpload = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  size: number;
  sourceHadTransparency: boolean;
};

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

const WEBP_QUALITIES = [0.92, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5];

const normalizeMimeType = (input: string): string => {
  const normalized = input.trim().toLowerCase();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
};

const isAllowedMimeType = (mimeType: string): boolean =>
  ICON_UPLOAD_DEFAULTS.allowedInputMimeTypes.includes(mimeType as (typeof ICON_UPLOAD_DEFAULTS.allowedInputMimeTypes)[number]);

const loadImageElement = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageProcessingError("Could not decode image"));
    };
    img.src = objectUrl;
  });

const toBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImageProcessingError("Failed to convert image for upload"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const detectTransparency = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
};

const resizeKeepingAspect = (width: number, height: number, maxWidth: number, maxHeight: number): { width: number; height: number } => {
  const ratio = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
};

export async function processImageForUpload(file: File): Promise<ProcessedImageForUpload> {
  const mimeType = normalizeMimeType(file.type);
  if (!isAllowedMimeType(mimeType)) {
    throw new ImageProcessingError("Invalid file type. Allowed: PNG, JPG, JPEG, WEBP.");
  }
  if (file.size > ICON_UPLOAD_DEFAULTS.maxInputFileSizeBytes) {
    throw new ImageProcessingError(`File is too large. Max input size is ${Math.round(ICON_UPLOAD_DEFAULTS.maxInputFileSizeBytes / (1024 * 1024))}MB.`);
  }

  const image = await loadImageElement(file);
  const initialSize = resizeKeepingAspect(
    image.naturalWidth,
    image.naturalHeight,
    ICON_UPLOAD_DEFAULTS.maxWidth,
    ICON_UPLOAD_DEFAULTS.maxHeight,
  );

  const probeCanvas = document.createElement("canvas");
  probeCanvas.width = initialSize.width;
  probeCanvas.height = initialSize.height;
  const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
  if (!probeCtx) throw new ImageProcessingError("Could not initialize image processing");
  probeCtx.clearRect(0, 0, probeCanvas.width, probeCanvas.height);
  probeCtx.drawImage(image, 0, 0, probeCanvas.width, probeCanvas.height);
  const sourceHadTransparency = detectTransparency(probeCtx, probeCanvas.width, probeCanvas.height);

  const preferredFormats = sourceHadTransparency
    ? (["image/png", "image/webp"] as const)
    : (["image/webp", "image/png"] as const);

  let best: ProcessedImageForUpload | null = null;
  let currentWidth = initialSize.width;
  let currentHeight = initialSize.height;

  for (let sizeAttempt = 0; sizeAttempt < 8; sizeAttempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageProcessingError("Could not initialize image processing");
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(image, 0, 0, currentWidth, currentHeight);

    for (const format of preferredFormats) {
      const qualities = format === "image/webp" ? WEBP_QUALITIES : [undefined];
      for (const quality of qualities) {
        const blob = await toBlob(canvas, format, quality);
        const candidate: ProcessedImageForUpload = {
          blob,
          width: currentWidth,
          height: currentHeight,
          mimeType: format,
          size: blob.size,
          sourceHadTransparency,
        };

        if (!best || candidate.size < best.size) {
          best = candidate;
        }
        if (candidate.size <= ICON_UPLOAD_DEFAULTS.preferredTargetSizeBytes) {
          return candidate;
        }
        if (candidate.size <= ICON_UPLOAD_DEFAULTS.maxOutputFileSizeBytes && format === preferredFormats[0]) {
          return candidate;
        }
      }
    }

    const nextWidth = Math.max(ICON_UPLOAD_DEFAULTS.minDimension, Math.floor(currentWidth * 0.9));
    const nextHeight = Math.max(ICON_UPLOAD_DEFAULTS.minDimension, Math.floor(currentHeight * 0.9));
    if (nextWidth === currentWidth && nextHeight === currentHeight) break;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  if (best && best.size <= ICON_UPLOAD_DEFAULTS.maxOutputFileSizeBytes) {
    return best;
  }
  throw new ImageProcessingError("Image could not be compressed below 2MB without severe quality loss.");
}
