import type { FastifyRequest } from "fastify";
import {
  PNG_SIGNATURE,
  POSTCARD_BACK_FIELD,
  POSTCARD_FRONT_FIELD,
  POSTCARD_MESSAGE_MAX_CHARS,
} from "../../../consts/postcard";

export type SharePostcardImages = { front: Buffer; back: Buffer };

export type ShareHaikuEmailRequest = {
  haikuId: string;
  emails: string[];
  message: string;
  postcard?: SharePostcardImages;
};

export type ShareHaikuEmailRequestResult =
  | { ok: true; value: ShareHaikuEmailRequest }
  | { ok: false; status: 400 | 413; error: string };

export const isPngBuffer = (buffer: Buffer): boolean =>
  buffer.length > PNG_SIGNATURE.length && buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);

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

const finalize = (
  fields: { haikuId?: unknown; emails?: unknown; message?: unknown },
  postcard?: SharePostcardImages,
): ShareHaikuEmailRequestResult => {
  const message = typeof fields.message === "string" ? fields.message.trim() : "";
  if (Array.from(message).length > POSTCARD_MESSAGE_MAX_CHARS) {
    return {
      ok: false,
      status: 400,
      error: `Message is too long (max ${POSTCARD_MESSAGE_MAX_CHARS} characters)`,
    };
  }
  return {
    ok: true,
    value: {
      haikuId: typeof fields.haikuId === "string" ? fields.haikuId.trim() : "",
      emails: parseEmailsField(fields.emails),
      message,
      postcard,
    },
  };
};

const isFileTooLarge = (err: unknown): boolean =>
  !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "FST_REQ_FILE_TOO_LARGE";

/**
 * Read /share_haiku_email input from JSON or multipart form data. Multipart must
 * carry both postcard sides as PNG files (`postcardFront`, `postcardBack`).
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
  const files: Partial<Record<string, Buffer>> = {};
  try {
    for await (const part of req.parts()) {
      if (part.type === "file") {
        if (part.fieldname !== POSTCARD_FRONT_FIELD && part.fieldname !== POSTCARD_BACK_FIELD) {
          await part.toBuffer();
          continue;
        }
        if (part.mimetype !== "image/png") {
          return { ok: false, status: 400, error: "Postcard images must be PNG" };
        }
        files[part.fieldname] = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }
  } catch (err) {
    if (isFileTooLarge(err)) {
      return { ok: false, status: 413, error: "Postcard image is too large" };
    }
    throw err;
  }

  const front = files[POSTCARD_FRONT_FIELD];
  const back = files[POSTCARD_BACK_FIELD];
  if (!front || !back) {
    return { ok: false, status: 400, error: "Both postcard images are required" };
  }
  if (!isPngBuffer(front) || !isPngBuffer(back)) {
    return { ok: false, status: 400, error: "Postcard images must be PNG" };
  }
  return finalize(fields, { front, back });
}
