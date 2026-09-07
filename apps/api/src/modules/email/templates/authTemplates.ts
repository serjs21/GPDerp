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
  const resetUrl = `${env.WEB_APP_URL}/?resetToken=${encodeURIComponent(token)}`;
  return {
    subject: "Reset your password",
    text: `Reset your password by opening this link:\n${resetUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>.</p><p>This link expires in 24 hours.</p>`,
  };
};

export const buildWelcomeEmail = () => {
  const homeUrl = env.CLIENT_URL;
  const completeUrl = `${env.WEB_APP_URL}/complete-registration`;
  return {
    subject: "Welcome to GPDerp",
    text: `Thanks for verifying your email. Your account is now active.\n\nIf you have not chosen a username yet, complete your profile here:\n${completeUrl}\n\nOr go to the app: ${homeUrl}`,
    html: `<p>Thanks for verifying your email. Your account is now active.</p><p>If you have not chosen a username yet, <a href="${completeUrl}">complete your registration</a>.</p><p>Or get started at <a href="${homeUrl}">${homeUrl}</a>.</p>`,
  };
};

export const buildSuspiciousRegistrationAttemptEmail = (params: { countryLabel: string }) => ({
  subject: "Security alert: sign-up attempt using your email",
  text: `Someone attempted to create a new account using this email address. The request appeared to originate from: ${params.countryLabel}.\n\nIf this was not you, you can ignore this message — your existing account is unchanged. If you are concerned, change your password from your account settings.`,
  html: `<p>Someone attempted to create a new account using <strong>this email address</strong>.</p><p>The request appeared to originate from: <strong>${params.countryLabel}</strong>.</p><p>If this was not you, you can ignore this message — your existing account is unchanged. If you are concerned, change your password from your account settings.</p>`,
});

export const buildEmailChangeVerificationEmail = (token: string, nextEmail: string) => {
  const verifyUrl = `${env.API_BASE_URL}/user/change-email/verify?token=${encodeURIComponent(token)}`;
  return {
    subject: "Confirm your new email",
    text: `We received a request to change your account email to ${nextEmail}.\nConfirm it here:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>We received a request to change your account email to <strong>${nextEmail}</strong>.</p><p>Confirm it by clicking <a href="${verifyUrl}">this link</a>.</p><p>This link expires in 24 hours.</p>`,
  };
};

export const buildEmailChangePreviousAddressAlert = (nextEmail: string) => ({
  subject: "Your account email change was requested",
  text: `A request was made to change your account email to ${nextEmail}.\nIf this wasn't you, please ignore this message.`,
  html: `<p>A request was made to change your account email to <strong>${nextEmail}</strong>.</p><p>If this wasn't you, please ignore this message.</p>`,
});
