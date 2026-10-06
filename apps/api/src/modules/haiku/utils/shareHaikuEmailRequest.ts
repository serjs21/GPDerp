import type { FastifyRequest } from "fastify";
import {
  PNG_SIGNATURE,
  POSTCARD_BACK_FIELD,
  POSTCARD_FRONT_FIELD,
  POSTCARD_MESSAGE_MAX_CHARS,
} from "../../../consts/postcard";

/** Shared front plus one back per recipient, keyed by normalized recipient email. */
export type SharePostcardImages = { front: Buffer; backs: Map<string, Buffer> };

export type ShareHaikuEmailRequest = {
  haikuId: string;
  emails: string[];
  message: string;
  postcard?: SharePostcardImages;
};

export type ShareHaikuEmailRequestResult =
  | { ok: true; value: ShareHaikuEmailRequest }
  | { ok: false; status: 400 | 413; error: string };

type RawPostcardFiles = { front?: Buffer; backs: Buffer[] };

export const normalizeShareRecipient = (email: string): string => email.trim().toLowerCase();

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

const pairPostcardFiles = (
  emails: string[],
  files: RawPostcardFiles,
): { ok: true; postcard: SharePostcardImages } | { ok: false; error: string } => {
  const { front, backs } = files;
  if (!front || backs.length === 0) {
    return { ok: false, error: "Both postcard images are required" };
  }
  if (backs.length !== emails.length) {
    return { ok: false, error: "Each recipient needs exactly one postcard back image" };
  }
  if (!isPngBuffer(front) || !backs.every(isPngBuffer)) {
    return { ok: false, error: "Postcard images must be PNG" };
  }
  const backsByRecipient = new Map(emails.map((email, index) => [normalizeShareRecipient(email), backs[index]]));
  return { ok: true, postcard: { front, backs: backsByRecipient } };
};

const finalize = (
  fields: { haikuId?: unknown; emails?: unknown; message?: unknown },
  files?: RawPostcardFiles,
): ShareHaikuEmailRequestResult => {
  const message = typeof fields.message === "string" ? fields.message.trim() : "";
  if (Array.from(message).length > POSTCARD_MESSAGE_MAX_CHARS) {
    return {
      ok: false,
      status: 400,
      error: `Message is too long (max ${POSTCARD_MESSAGE_MAX_CHARS} characters)`,
    };
  }
  const emails = parseEmailsField(fields.emails);
  let postcard: SharePostcardImages | undefined;
  if (files) {
    const paired = pairPostcardFiles(emails, files);
    if (!paired.ok) return { ok: false, status: 400, error: paired.error };
    postcard = paired.postcard;
  }
  return {
    ok: true,
    value: {
      haikuId: typeof fields.haikuId === "string" ? fields.haikuId.trim() : "",
      emails,
      message,
      postcard,
    },
  };
};

const isFileTooLarge = (err: unknown): boolean =>
  !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "FST_REQ_FILE_TOO_LARGE";

/**
 * Read /share_haiku_email input from JSON or multipart form data. Multipart must carry
 * one `postcardFront` PNG and one `postcardBack` PNG per entry in `emails` (same order).
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
  const files: RawPostcardFiles = { backs: [] };
  try {
    for await (const part of req.parts()) {
      if (part.type !== "file") {
        fields[part.fieldname] = part.value;
        continue;
      }
      if (part.fieldname !== POSTCARD_FRONT_FIELD && part.fieldname !== POSTCARD_BACK_FIELD) {
        await part.toBuffer();
        continue;
      }
      if (part.mimetype !== "image/png") {
        return { ok: false, status: 400, error: "Postcard images must be PNG" };
      }
      const buffer = await part.toBuffer();
      if (part.fieldname === POSTCARD_FRONT_FIELD) files.front = buffer;
      else files.backs.push(buffer);
    }
  } catch (err) {
    if (isFileTooLarge(err)) {
      return { ok: false, status: 413, error: "Postcard image is too large" };
    }
    throw err;
  }

  return finalize(fields, files);
}
