import type { FastifyBaseLogger } from "fastify/types/logger";
import { EmailActionType } from "../../generated/prisma";
import { AUTH_TTL } from "./constants";
import { authRepository } from "./repository";
import { tokenService } from "./tokenService";
import { addSeconds, hashToken } from "./utils";
import { buildVerificationEmail } from "../email/templates/authTemplates";
import { mailService } from "../email/mailService";

export async function sendVerificationEmail(
  log: FastifyBaseLogger,
  email: string,
  userId: string,
): Promise<void> {
  await authRepository.invalidateEmailActionTokens({
    userId,
    type: EmailActionType.EMAIL_VERIFICATION,
  });

  const rawToken = tokenService.createRefreshToken();
  await authRepository.createEmailActionToken({
    userId,
    type: EmailActionType.EMAIL_VERIFICATION,
    tokenHash: hashToken(rawToken),
    expiresAt: addSeconds(AUTH_TTL.verificationTokenSeconds),
  });
  const message = buildVerificationEmail(rawToken);
  try {
    await mailService.sendEmail({
      to: email,
      ...message,
    });
  } catch (err) {
    log.error(
      { err, authFailure: true, step: "verification_email_send", userId },
      "auth: failed to send verification email",
    );
    throw err;
  }
}
