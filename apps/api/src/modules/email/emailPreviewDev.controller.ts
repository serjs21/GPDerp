import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../../env";
import { POSTCARD_BACK_CID, POSTCARD_FRONT_CID } from "../../consts/postcard";
import { formatCountryLabel } from "../../utils/requestCountry";
import {
  buildEmailChangePreviousAddressAlert,
  buildEmailChangeVerificationEmail,
  buildPasswordResetEmail,
  buildSuspiciousRegistrationAttemptEmail,
  buildVerificationEmail,
  buildWelcomeEmail,
} from "./templates/authTemplates";
import { buildShareHaikuEmail } from "./templates/shareHaikuTemplate";

export const isEmailPreviewDevRouteEnabled = (processEnv: NodeJS.ProcessEnv = process.env) =>
  processEnv.NODE_ENV !== "production";

type BuiltEmail = { subject: string; html: string; text: string };

export type EmailPreviewInlineImage =
  | { cid: string; kind: "postcardBack"; path: string }
  | { cid: string; kind: "postcardFront" };

export type EmailPreview = BuiltEmail & {
  id: string;
  label: string;
  from: string;
  to: string;
  replyTo?: string;
  inlineImages: EmailPreviewInlineImage[];
  /** Haiku the postcard front is rendered from (the web app renders it, as in the real share flow). */
  postcardHaiku?: { title: string; body: string };
};

const SAMPLE_TOKEN = "sample-token-0123456789abcdef";
const SAMPLE_RECIPIENT = "reader@example.com";
const SAMPLE_NEW_EMAIL = "new@example.com";
const SAMPLE_SHARE = {
  senderName: "Hiro",
  senderEmail: "hiro@example.com",
  personalMessage: "Found this on my walk home and thought of you.",
  title: "Old pond",
  body: "An old silent pond\nA frog jumps into the pond\nSplash! Silence again\n—Matsuo Basho",
};

const preview = (
  id: string,
  label: string,
  email: BuiltEmail,
  extra: Partial<Pick<EmailPreview, "to" | "replyTo" | "inlineImages" | "postcardHaiku">> = {},
): EmailPreview => ({
  id,
  label,
  from: env.MAIL_FROM,
  to: SAMPLE_RECIPIENT,
  inlineImages: [],
  ...email,
  ...extra,
});

const sharePostcardPreview = (): EmailPreview => {
  const backQuery = new URLSearchParams({
    message: SAMPLE_SHARE.personalMessage,
    senderName: SAMPLE_SHARE.senderName,
  });
  return preview(
    "shareHaikuPostcard",
    "Share haiku (postcard)",
    buildShareHaikuEmail({ ...SAMPLE_SHARE, postcard: { hasFront: true } }),
    {
      replyTo: SAMPLE_SHARE.senderEmail,
      inlineImages: [
        { cid: POSTCARD_FRONT_CID, kind: "postcardFront" },
        { cid: POSTCARD_BACK_CID, kind: "postcardBack", path: `/dev/postcard_back.png?${backQuery}` },
      ],
      postcardHaiku: { title: SAMPLE_SHARE.title, body: SAMPLE_SHARE.body },
    },
  );
};

/** Every email the API sends, built by its real template with fixed sample data. */
export function buildEmailPreviews(): EmailPreview[] {
  return [
    preview("verifyEmail", "Verify email", buildVerificationEmail(SAMPLE_TOKEN)),
    preview("welcome", "Welcome", buildWelcomeEmail()),
    preview("passwordReset", "Password reset", buildPasswordResetEmail(SAMPLE_TOKEN)),
    preview(
      "signupAttemptAlert",
      "Sign-up attempt alert",
      buildSuspiciousRegistrationAttemptEmail({ countryLabel: formatCountryLabel("JP") }),
    ),
    preview(
      "emailChangeConfirm",
      "Confirm new email",
      buildEmailChangeVerificationEmail(SAMPLE_TOKEN, SAMPLE_NEW_EMAIL),
      { to: SAMPLE_NEW_EMAIL },
    ),
    preview(
      "emailChangeOldAddressAlert",
      "Email change alert (old address)",
      buildEmailChangePreviousAddressAlert(SAMPLE_NEW_EMAIL, SAMPLE_TOKEN),
    ),
    sharePostcardPreview(),
    preview(
      "shareHaikuText",
      "Share haiku (text only)",
      buildShareHaikuEmail(SAMPLE_SHARE),
      { replyTo: SAMPLE_SHARE.senderEmail },
    ),
  ];
}

/** Dev-only: rendered emails for the Storybook Gmail previews. No auth, no DB, nothing is sent. */
export const emailPreviewDevPlugin = fp(async (app: FastifyInstance) => {
  app.get("/dev/emails", async (_req, res) => res.send({ ok: true, data: buildEmailPreviews() }));
});
