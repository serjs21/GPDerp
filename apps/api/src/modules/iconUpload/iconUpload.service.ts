import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../env";

const ICON_UPLOAD_DEBUG = process.env.ICON_UPLOAD_DEBUG === "true";

const debugLog = (...args: unknown[]) => {
  if (ICON_UPLOAD_DEBUG) console.log("[iconUpload:debug]", ...args);
};

const describePresignedUrl = (uploadUrl: string) => {
  try {
    const u = new URL(uploadUrl);
    return {
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      searchParamCount: [...u.searchParams.keys()].length,
      signedHeaders: u.searchParams.get("X-Amz-SignedHeaders"),
      amzDate: u.searchParams.get("X-Amz-Date"),
      expiresIn: u.searchParams.get("X-Amz-Expires"),
      queryKeys: [...u.searchParams.keys()].sort(),
    };
  } catch {
    return { parseError: true as const, rawPrefix: uploadUrl.slice(0, 120) };
  }
};

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const MAX_ICON_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const PRESIGNED_UPLOAD_TTL_SECONDS = 60;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const r2Client = new S3Client({
  region: env.R2_REGION,
  endpoint: env.R2_S3_ENDPOINT,
  // Without path style, the SDK signs virtual-hosted AWS URLs (bucket.s3.region.amazonaws.com),
  // which do not resolve for R2.
  forcePathStyle: true,
  // Default SDK behavior adds CRC32 to presigned PUTs (query params), which triggers heavier
  // CORS preflights. R2 PUT does not require it for our use case.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

if (ICON_UPLOAD_DEBUG) {
  debugLog("R2 S3 client config", {
    endpoint: env.R2_S3_ENDPOINT,
    region: env.R2_REGION,
    bucket: env.R2_BUCKET_NAME,
    forcePathStyle: true,
    accessKeyIdPrefix: `${env.R2_ACCESS_KEY_ID.slice(0, 8)}…`,
  });
}

export type CreateIconUploadInput = {
  contentType: string;
  sizeBytes: number;
};

export type CreateIconUploadResult =
  | {
      ok: true;
      uploadUrl: string;
      key: string;
      publicUrl: string;
      expiresInSeconds: number;
      maxUploadSizeBytes: number;
    }
  | {
      ok: false;
      error: "invalid_mime_type" | "invalid_size" | "signing_failed";
    };

const pad2 = (value: number): string => String(value).padStart(2, "0");

const normalizeMimeType = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
};

const buildIconObjectKey = (normalizedMimeType: string): { key: string; publicUrl: string } => {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = pad2(now.getUTCMonth() + 1);
  const ext = MIME_TO_EXTENSION[normalizedMimeType] ?? "bin";
  const key = `icons/${yyyy}/${mm}/${randomUUID()}.${ext}`;
  const publicUrl = `${env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;
  return { key, publicUrl };
};

export type UploadIconBufferInput = {
  buffer: Buffer;
  contentType: string;
};

export type UploadIconBufferResult =
  | { ok: true; key: string; publicUrl: string }
  | { ok: false; error: "invalid_mime_type" | "invalid_size" | "upload_failed" };

export const iconUploadService = {
  maxUploadSizeBytes: MAX_ICON_UPLOAD_SIZE_BYTES,
  allowedMimeTypes: [...ALLOWED_MIME_TYPES],

  async uploadIconBuffer(input: UploadIconBufferInput): Promise<UploadIconBufferResult> {
    const normalizedMimeType = normalizeMimeType(input.contentType);
    debugLog("uploadIconBuffer input", {
      contentType: input.contentType,
      normalizedMimeType,
      byteLength: input.buffer.length,
    });
    if (!ALLOWED_MIME_TYPES.has(normalizedMimeType)) {
      return { ok: false, error: "invalid_mime_type" };
    }
    if (input.buffer.length <= 0 || input.buffer.length > MAX_ICON_UPLOAD_SIZE_BYTES) {
      return { ok: false, error: "invalid_size" };
    }

    const { key, publicUrl } = buildIconObjectKey(normalizedMimeType);
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: key,
          Body: input.buffer,
          ContentType: normalizedMimeType,
        }),
      );
      debugLog("uploadIconBuffer PutObject ok", { key });
      return { ok: true, key, publicUrl };
    } catch (err) {
      console.error("[iconUpload] PutObject failed", err);
      debugLog("uploadIconBuffer PutObject context", {
        endpoint: env.R2_S3_ENDPOINT,
        bucket: env.R2_BUCKET_NAME,
        key,
      });
      return { ok: false, error: "upload_failed" };
    }
  },

  async createPresignedUpload(input: CreateIconUploadInput): Promise<CreateIconUploadResult> {
    const normalizedMimeType = normalizeMimeType(input.contentType);
    debugLog("createPresignedUpload input", {
      contentType: input.contentType,
      normalizedMimeType,
      sizeBytes: input.sizeBytes,
      sizeBytesFinite: Number.isFinite(input.sizeBytes),
    });
    if (!ALLOWED_MIME_TYPES.has(normalizedMimeType)) {
      return { ok: false, error: "invalid_mime_type" };
    }

    if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0 || input.sizeBytes > MAX_ICON_UPLOAD_SIZE_BYTES) {
      return { ok: false, error: "invalid_size" };
    }

    const { key, publicUrl } = buildIconObjectKey(normalizedMimeType);

    try {
      // Omit ContentType so the presigned PUT matches a browser upload that sends no Content-Type
      // header (see web upload: ArrayBuffer body). R2/SigV4 presigner does not sign content-type.
      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      });

      const uploadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: PRESIGNED_UPLOAD_TTL_SECONDS,
      });

      const urlInfo = describePresignedUrl(uploadUrl);
      debugLog("presigned PUT", { key, urlInfo });

      if (
        typeof urlInfo === "object" &&
        "host" in urlInfo &&
        typeof urlInfo.host === "string" &&
        urlInfo.host.includes("amazonaws.com")
      ) {
        console.warn("[iconUpload] presigned URL host looks like AWS S3, not R2", {
          host: urlInfo.host,
          expectedEndpointHost: (() => {
            try {
              return new URL(env.R2_S3_ENDPOINT).host;
            } catch {
              return env.R2_S3_ENDPOINT;
            }
          })(),
        });
      }

      return {
        ok: true,
        uploadUrl,
        key,
        publicUrl,
        expiresInSeconds: PRESIGNED_UPLOAD_TTL_SECONDS,
        maxUploadSizeBytes: MAX_ICON_UPLOAD_SIZE_BYTES,
      };
    } catch (err) {
      console.error("[iconUpload] presign failed", err);
      debugLog("presign context", {
        endpoint: env.R2_S3_ENDPOINT,
        region: env.R2_REGION,
        bucket: env.R2_BUCKET_NAME,
        key,
        forcePathStyle: true,
      });
      return { ok: false, error: "signing_failed" };
    }
  },
};
