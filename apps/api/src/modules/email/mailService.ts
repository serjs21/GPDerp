import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { env } from "../../env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  // Fail a hung attempt fast so the postcard queue can retry it.
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
});

const assertMailConfig = () => {
  if (!env.SMTP_HOST || !env.MAIL_FROM) {
    throw new Error("Mail transport is not configured. Set SMTP_HOST and MAIL_FROM.");
  }
};

export const mailService = {
  async sendEmail(params: {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
    attachments?: SendMailOptions["attachments"];
  }) {
    assertMailConfig();
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      replyTo: params.replyTo,
      attachments: params.attachments,
    });
  },
};
