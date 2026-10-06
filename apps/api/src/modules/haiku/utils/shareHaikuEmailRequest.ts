import type { FastifyRequest } from "fastify";
import {
  PNG_SIGNATURE,
  POSTCARD_BACK_FIELD,
  POSTCARD_FRONT_FIELD,
  POSTCARD_MESSAGE_MAX_CHARS,
  POSTCARD_PNG_HEIGHT,
  POSTCARD_PNG_WIDTH,
} from "../../../consts/postcard";

export type ShareHaikuEmailRequest = {
  haikuId: string;
  emails: string[];
  message: string;
  /** Browser-rendered postcard front; backs are rendered per recipient on the server. */
  front?: Buffer;
};

export type ShareHaikuEmailRequestResult =
  | { ok: true; value: ShareHaikuEmailRequest }
  | { ok: false; status: 400 | 413; error: string };

/** Signature (8) + IHDR length (4) + "IHDR" (4) + width (4) + height (4). */
const PNG_IHDR_END = 24;

export const normalizeShareRecipient = (email: string): string => email.trim().toLowerCase();

export const isPngBuffer = (buffer: Buffer): boolean =>
  buffer.length > PNG_SIGNATURE.length && buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);

export const readPngSize = (buffer: Buffer): { width: number; height: number } | null => {
  if (!isPngBuffer(buffer) || buffer.length < PNG_IHDR_END) return null;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

const parseEmailsField = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
};

const validateFront = (front: Buffer): string | null => {
  const size = readPngSize(front);
  if (!size) return "Postcard front must be a PNG";
  if (size.width !== POSTCARD_PNG_WIDTH || size.height !== POSTCARD_PNG_HEIGHT) {
    return `Postcard front must be ${POSTCARD_PNG_WIDTH}x${POSTCARD_PNG_HEIGHT} (got ${size.width}x${size.height})`;
  }
  return null;
};

const finalize = (
  fields: { haikuId?: unknown; emails?: unknown; message?: unknown },
  front?: Buffer,
): ShareHaikuEmailRequestResult => {
  const message = typeof fields.message === "string" ? fields.message.trim() : "";
  if (Array.from(message).length > POSTCARD_MESSAGE_MAX_CHARS) {
    return {
      ok: false,
      status: 400,
      error: `Message is too long (max ${POSTCARD_MESSAGE_MAX_CHARS} characters)`,
    };
  }
  if (front) {
    const frontError = validateFront(front);
    if (frontError) return { ok: false, status: 400, error: frontError };
  }
  return {
    ok: true,
    value: {
      haikuId: typeof fields.haikuId === "string" ? fields.haikuId.trim() : "",
      emails: parseEmailsField(fields.emails),
      message,
      front,
    },
  };
};

const isFileTooLarge = (err: unknown): boolean =>
  !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "FST_REQ_FILE_TOO_LARGE";

/**
 * Read /share_haiku_email input from JSON or multipart form data. Multipart carries one
 * optional `postcardFront` PNG (2400x1600); backs are rendered by the server.
 */
export async function readShareHaikuEmailRequest(
  req: FastifyRequest,
): Promise<ShareHaikuEmailRequestResult> {
  const multipart = typeof req.isMultipart === "function" && req.isMultipart();
  if (!multipart) {
    const body = (req.body as Record<string, unknown> | undefined) ?? {};
    return finalize(body);
  }

  const fields: Record<string, unknown> = {};
  let front: Buffer | undefined;
  try {
    for await (const part of req.parts()) {
      if (part.type !== "file") {
        fields[part.fieldname] = part.value;
        continue;
      }
      if (part.fieldname === POSTCARD_BACK_FIELD) {
        await part.toBuffer();
        return { ok: false, status: 400, error: "Postcard backs are rendered by the server; send only the front" };
      }
      if (part.fieldname !== POSTCARD_FRONT_FIELD) {
        await part.toBuffer();
        continue;
      }
      if (part.mimetype !== "image/png") {
        return { ok: false, status: 400, error: "Postcard front must be a PNG" };
      }
      front = await part.toBuffer();
    }
  } catch (err) {
    if (isFileTooLarge(err)) {
      return { ok: false, status: 413, error: "Postcard image is too large" };
    }
    throw err;
  }

  return finalize(fields, front);
}
