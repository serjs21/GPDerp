import { env } from "../../../env";

export const buildVerificationEmail = (token: string) => {
  const verifyUrl = `${env.API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
  return {
    subject: "Verify your email",
    text: `Welcome! Verify your email by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome!</p><p>Verify your email by clicking <a href="${verifyUrl}">this link</a>.</p><p>This link expires in 24 hours.</p>`,
  };
};

export const buildPasswordResetEmail = (token: string) => {
  const resetUrl = `${env.WEB_APP_URL}/reset_password?token=${encodeURIComponent(token)}`;
  return {
    subject: "Reset your password",
    text: `Reset your password by opening this link:\n${resetUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>.</p><p>This link expires in 24 hours.</p>`,
  };
};
