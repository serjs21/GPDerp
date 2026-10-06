import { POSTCARD_BACK_CID, POSTCARD_FRONT_CID } from "../../consts/postcard";
import { mailService } from "../email/mailService";
import { buildShareHaikuEmail } from "../email/templates/shareHaikuTemplate";
import { PostcardMessageTooLongError, renderPostcardBackPng } from "./postcardBackRenderer";
import { postcardBatchRepository, type PostcardBatchForSend } from "./postcardBatch.repository";

export type PostcardEmailJobData = { batchId: string; recipient: string };

export type PostcardEmailJobOutcome = "sent" | "failed_permanently";

const LOG_PREFIX = "[postcardEmail]";

/**
 * SMTP 5xx (e.g. 550 mailbox unavailable) will not succeed on retry. Auth failures (535,
 * `EAUTH`) are our own misconfiguration, so they keep retrying until credentials are fixed.
 */
export const isPermanentSmtpError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  if ((err as { code?: unknown }).code === "EAUTH") return false;
  const code = (err as { responseCode?: unknown }).responseCode;
  return typeof code === "number" && code >= 500 && code < 600;
};

const buildAttachments = (batch: PostcardBatchForSend, back: Buffer) => [
  ...(batch.frontPng
    ? [{ filename: "postcard-front.png", content: batch.frontPng, contentType: "image/png", cid: POSTCARD_FRONT_CID }]
    : []),
  { filename: "postcard-back.png", content: back, contentType: "image/png", cid: POSTCARD_BACK_CID },
];

const failPermanently = async (data: PostcardEmailJobData, reason: string, err?: unknown) => {
  console.error(LOG_PREFIX, "permanent failure, not retrying", { ...data, reason }, err ?? "");
  await postcardBatchRepository.markFailed(data.batchId);
  return "failed_permanently" as const;
};

/**
 * Render one recipient's back and email it with the shared front. Throws on transient
 * errors so pg-boss retries; permanent errors are recorded and the job completes.
 */
export async function processPostcardEmailJob(data: PostcardEmailJobData): Promise<PostcardEmailJobOutcome> {
  const batch = await postcardBatchRepository.findForSend(data.batchId);
  if (!batch) {
    console.error(LOG_PREFIX, "batch not found, dropping job", data);
    return "failed_permanently";
  }

  let back: Buffer;
  try {
    back = await renderPostcardBackPng({
      message: batch.message,
      senderName: batch.senderName,
      recipient: data.recipient,
    });
  } catch (err) {
    if (err instanceof PostcardMessageTooLongError) return failPermanently(data, "message_too_long", err);
    throw err;
  }

  const email = buildShareHaikuEmail({
    senderName: batch.senderName,
    personalMessage: batch.message,
    title: batch.haikuTitle,
    body: batch.haikuBody,
    postcard: { hasFront: !!batch.frontPng },
  });

  try {
    await mailService.sendEmail({
      to: data.recipient,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: batch.senderEmail,
      attachments: buildAttachments(batch, back),
    });
  } catch (err) {
    if (isPermanentSmtpError(err)) return failPermanently(data, "smtp_rejected", err);
    throw err;
  }

  await postcardBatchRepository.markSent(data.batchId);
  return "sent";
}

/** Dead-letter handler: the job exhausted its retries. */
export async function processPostcardEmailDeadLetter(data: PostcardEmailJobData): Promise<void> {
  console.error(LOG_PREFIX, "retries exhausted, giving up", data);
  await postcardBatchRepository.markFailed(data.batchId);
}
