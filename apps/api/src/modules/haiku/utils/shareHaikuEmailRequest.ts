import type { FastifyRequest } from "fastify";
import {
  POSTCARD_BACK_FIELD,
  POSTCARD_FRONT_FIELD,
  POSTCARD_FRONT_MIME_TYPES,
  POSTCARD_MESSAGE_MAX_CHARS,
  POSTCARD_PNG_HEIGHT,
  POSTCARD_PNG_WIDTH,
} from "../../../consts/postcard";
import { readPostcardImageInfo } from "../../../utils/postcardImage";

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

const FRONT_TYPE_ERROR = "Postcard front must be a JPEG or PNG";

export const normalizeShareRecipient = (email: string): string => email.trim().toLowerCase();

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
  const size = readPostcardImageInfo(front);
  if (!size) return FRONT_TYPE_ERROR;
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
 * optional `postcardFront` JPEG or PNG (2400x1600); backs are rendered by the server.
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
      if (!POSTCARD_FRONT_MIME_TYPES.includes(part.mimetype)) {
        return { ok: false, status: 400, error: FRONT_TYPE_ERROR };
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
