import { EmailActionType } from "../../../generated/prisma";
import { authService } from "../auth.service";
import { hashPassword } from "../utils";
import { userService } from "../../user/user.service";
import { sendVerificationEmail } from "../verificationEmail";

jest.mock("../repository", () => ({
  authRepository: {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    findUserByUserName: jest.fn(),
    findGoogleIdentityByProviderAccountId: jest.fn(),
    createUserWithWorkspace: jest.fn(),
    attachManualAuth: jest.fn(),
    createSession: jest.fn(),
    createRefreshToken: jest.fn(),
    invalidateEmailActionTokens: jest.fn(),
    createEmailActionToken: jest.fn(),
    attachGoogleIdentity: jest.fn(),
    updateGoogleAvatarIfNotManual: jest.fn(),
    markUserEmailVerified: jest.fn(),
    findRefreshTokenByHash: jest.fn(),
    rotateRefreshTokenAtomic: jest.fn(),
    revokeSession: jest.fn(),
    consumeEmailActionToken: jest.fn(),
    findEmailActionTokenByHash: jest.fn(),
    updatePassword: jest.fn(),
    revokeAllSessionsForUser: jest.fn(),
    countFailedLoginAttemptsSince: jest.fn(),
    recordFailedLoginAttempt: jest.fn(),
    clearFailedLoginAttemptsForEmail: jest.fn(),
  },
}));

jest.mock("../googleService", () => ({
  googleService: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock("../../email/mailService", () => ({
  mailService: {
    sendEmail: jest.fn(),
  },
}));

jest.mock("../verificationEmail", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("../tokenService", () => ({
  tokenService: {
    sessionExpiresAt: jest.fn(() => new Date("2030-01-01T00:00:00.000Z")),
    refreshExpiresAt: jest.fn(() => new Date("2030-01-01T00:10:00.000Z")),
    createRefreshToken: jest.fn(() => "raw-refresh-token"),
    createAccessToken: jest.fn(() => "access-token"),
    createCsrfToken: jest.fn(() => "csrf-token"),
  },
}));

const { authRepository } = jest.requireMock("../repository") as any;
const { googleService } = jest.requireMock("../googleService") as any;
const { mailService } = jest.requireMock("../../email/mailService") as any;

const mockLog = {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  child: () => mockLog,
};
const mockApp = { log: mockLog } as any;
const mockRequest = {
  ip: "127.0.0.1",
  headers: { "user-agent": "jest-test-agent", "cf-ipcountry": "US" },
} as any;

const setupSessionMocks = () => {
  authRepository.createSession.mockResolvedValue({ id: "session-1", userId: "user-1" });
  authRepository.createRefreshToken.mockResolvedValue({ id: "rt-1" });
  authRepository.countFailedLoginAttemptsSince.mockResolvedValue(0);
  authRepository.clearFailedLoginAttemptsForEmail.mockResolvedValue({ count: 0 });
  authRepository.findUserById.mockImplementation((id: string) =>
    Promise.resolve({
      id,
      userName: id === "google-user-1" ? "google_person" : "new_user",
      avatar: "",
      emailVerifiedAt: null,
    }),
  );
};

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSessionMocks();
    jest.spyOn(userService, "registerNewLocalUser").mockResolvedValue({
      outcome: "created",
      userId: "user-1",
      normalizedEmail: "new@example.com",
    });
  });

  it("registers a manual user successfully", async () => {
    const result = await authService.registerManual(mockApp, mockRequest, {
      email: "NEW@EXAMPLE.COM",
      password: "password123",
      firstName: "New",
      lastName: "User",
    });

    expect(userService.registerNewLocalUser).toHaveBeenCalledWith(
      expect.objectContaining({
        emailRaw: "NEW@EXAMPLE.COM",
        countryCode: "US",
      }),
    );
    expect(sendVerificationEmail).toHaveBeenCalledWith(mockLog, "new@example.com", "user-1");
    expect(result).toEqual({
      status: "session",
      tokens: {
        accessToken: "access-token",
        refreshToken: "raw-refresh-token",
        csrfToken: "csrf-token",
      },
    });
  });

  it("logs in manually with valid password", async () => {
    const passwordHash = await hashPassword("password123");
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      authIdentities: [],
      passwordCredential: { passwordHash },
    });

    const result = await authService.loginManual(mockApp, mockRequest, {
      email: "USER@EXAMPLE.COM",
      password: "password123",
    });

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(authRepository.clearFailedLoginAttemptsForEmail).toHaveBeenCalledWith("user@example.com");
    expect(result.accessToken).toBe("access-token");
  });

  it("fails manual login with bad password", async () => {
    const passwordHash = await hashPassword("password123");
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      authIdentities: [],
      passwordCredential: { passwordHash },
    });

    await expect(
      authService.loginManual(mockApp, mockRequest, {
        email: "user@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Invalid email or password");
    expect(authRepository.recordFailedLoginAttempt).toHaveBeenCalledWith("user@example.com");
  });

  it("returns neutral when email already exists (duplicate handled in user service)", async () => {
    (userService.registerNewLocalUser as jest.Mock).mockResolvedValueOnce({
      outcome: "duplicate_handled",
      normalizedEmail: "user@example.com",
    });

    const result = await authService.registerManual(mockApp, mockRequest, {
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({ status: "neutral" });
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("returns neutral for duplicate google-only email without throwing", async () => {
    (userService.registerNewLocalUser as jest.Mock).mockResolvedValueOnce({
      outcome: "duplicate_handled",
      normalizedEmail: "google.only@example.com",
    });

    const result = await authService.registerManual(mockApp, mockRequest, {
      email: "google.only@example.com",
      password: "password123",
    });

    expect(result).toEqual({ status: "neutral" });
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("rejects password login for google-only accounts", async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      passwordCredential: null,
      authIdentities: [{ provider: "GOOGLE" }],
    });

    await expect(
      authService.loginManual(mockApp, mockRequest, {
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("This account uses Google sign-in");
  });

  it("returns too many attempts when login is rate limited", async () => {
    authRepository.countFailedLoginAttemptsSince.mockResolvedValue(5);

    await expect(
      authService.loginManual(mockApp, mockRequest, {
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Too many failed attempts");
  });

  it("creates a new user on first google login with a unique username", async () => {
    googleService.verifyIdToken.mockResolvedValue({
      sub: "google-sub-new",
      email: "NEWGOOGLE@EXAMPLE.COM",
      emailVerified: true,
      firstName: "New",
      lastName: "Google",
      avatar: "https://avatar.example/newgoogle.png",
    });
    authRepository.findGoogleIdentityByProviderAccountId.mockResolvedValue(null);
    authRepository.findUserByEmail.mockResolvedValue(null);
    authRepository.findUserByUserName.mockResolvedValue(null);
    authRepository.createUserWithWorkspace.mockResolvedValue({ id: "new-user" });

    await authService.loginGoogle(mockApp, mockRequest, { token: "google-token" });

    expect(authRepository.createUserWithWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newgoogle@example.com",
        userName: "newgoogle",
        provider: "GOOGLE",
      }),
    );
  });

  it("links google auth to existing manual user by same verified email", async () => {
    googleService.verifyIdToken.mockResolvedValue({
      sub: "google-sub-1",
      email: "USER@EXAMPLE.COM",
      emailVerified: true,
      firstName: "User",
      lastName: "Example",
      avatar: "https://avatar.example/user.png",
    });
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: null,
      authIdentities: [],
    });

    await authService.loginGoogle(mockApp, mockRequest, { token: "google-token" });

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(authRepository.attachGoogleIdentity).toHaveBeenCalledWith({
      userId: "user-1",
      providerAccountId: "google-sub-1",
    });
    expect(authRepository.markUserEmailVerified).toHaveBeenCalledWith("user-1");
  });

  it("rejects google auth when email is not verified", async () => {
    googleService.verifyIdToken.mockResolvedValue({
      sub: "google-sub-1",
      email: "user@example.com",
      emailVerified: false,
      firstName: "User",
      lastName: "Example",
      avatar: "https://avatar.example/user.png",
    });

    await expect(authService.loginGoogle(mockApp, mockRequest, { token: "bad-token" })).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("creates verification token and invalidates previous tokens when resending", async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: null,
    });

    await authService.resendVerification(mockApp, "USER@example.com");

    expect(sendVerificationEmail).toHaveBeenCalledWith(mockLog, "user@example.com", "user-1");
  });

  it("creates reset token during password reset request", async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
    });

    await authService.requestPasswordReset("RESET@Example.com");

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith("reset@example.com");
    expect(authRepository.createEmailActionToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: EmailActionType.PASSWORD_RESET,
      }),
    );
    expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("confirms password reset and updates password", async () => {
    authRepository.consumeEmailActionToken.mockResolvedValue({
      userId: "user-1",
    });

    await authService.confirmPasswordReset(mockApp, {
      token: "reset-token",
      password: "newpassword123",
    });

    expect(authRepository.updatePassword).toHaveBeenCalledWith(
      "user-1",
      expect.any(String),
    );
    expect(authRepository.invalidateEmailActionTokens).toHaveBeenCalledWith({
      userId: "user-1",
      type: EmailActionType.PASSWORD_RESET,
    });
    expect(authRepository.revokeAllSessionsForUser).toHaveBeenCalledWith(
      "user-1",
      "password_reset",
    );
  });

  it("rotates refresh token successfully", async () => {
    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: "rt-1",
      sessionId: "session-1",
      session: {
        id: "session-1",
        userId: "user-1",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60),
      },
    });
    authRepository.rotateRefreshTokenAtomic.mockResolvedValue({
      status: "ok",
      nextToken: { id: "rt-2" },
    });

    const result = await authService.refresh(mockApp, "presented-token");
    expect(authRepository.rotateRefreshTokenAtomic).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "raw-refresh-token",
      csrfToken: "csrf-token",
    });
  });

  it("detects refresh token reuse and rejects refresh", async () => {
    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: "rt-1",
      sessionId: "session-affected",
      session: {
        id: "session-affected",
        userId: "user-1",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60),
      },
    });
    authRepository.rotateRefreshTokenAtomic.mockResolvedValue({
      status: "reused",
    });

    await expect(authService.refresh(mockApp, "replayed-token")).rejects.toThrow("Unauthorized");
    expect(authRepository.rotateRefreshTokenAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        currentToken: expect.objectContaining({
          sessionId: "session-affected",
        }),
      }),
    );
  });

  it("revokes current session on logout", async () => {
    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: "rt-1",
      sessionId: "session-1",
    });

    await authService.logout("logout-token");
    expect(authRepository.revokeSession).toHaveBeenCalledWith("session-1", "logout");
  });

  it("returns signup_required profile for unknown google user in login flow", async () => {
    googleService.verifyIdToken.mockResolvedValue({
      sub: "google-sub-signup",
      email: "new.signup@example.com",
      emailVerified: true,
      firstName: "New",
      lastName: "Signup",
      avatar: "https://avatar.example/new-signup.png",
    });
    authRepository.findGoogleIdentityByProviderAccountId.mockResolvedValue(null);
    authRepository.findUserByEmail.mockResolvedValue(null);

    const result = await authService.loginGoogleForLoginFlow(mockApp, mockRequest, {
      token: "google-token-signup",
    });

    expect(result).toEqual({
      status: "signup_required",
      profile: {
        email: "new.signup@example.com",
        firstName: "New",
        lastName: "Signup",
        avatar: "https://avatar.example/new-signup.png",
      },
    });
  });

  it("registers google user with username and profile details", async () => {
    googleService.verifyIdToken.mockResolvedValue({
      sub: "google-sub-register",
      email: "register@example.com",
      emailVerified: true,
      firstName: "Google",
      lastName: "Person",
      avatar: "https://avatar.example/google-person.png",
    });
    authRepository.findUserByEmail.mockResolvedValue(null);
    authRepository.findGoogleIdentityByProviderAccountId.mockResolvedValue(null);
    authRepository.createUserWithWorkspace.mockResolvedValue({ id: "google-user-1" });

    const result = await authService.registerGoogleWithUsername(mockApp, mockRequest, {
      token: "google-register-token",
      userName: "google_person",
      firstName: "Given",
      lastName: "Name",
      avatar: "https://avatar.example/custom.png",
    });

    expect(authRepository.createUserWithWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "register@example.com",
        userName: "google_person",
        firstName: "Given",
        lastName: "Name",
        avatar: "https://avatar.example/custom.png",
        provider: "GOOGLE",
        providerAccountId: "google-sub-register",
      }),
    );
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "raw-refresh-token",
      csrfToken: "csrf-token",
    });
  });

  it("sends a welcome email after successful email verification", async () => {
    authRepository.findEmailActionTokenByHash.mockResolvedValue({
      id: "email-token-1",
      userId: "user-verified",
      type: EmailActionType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 10_000),
      usedAt: null,
      invalidatedAt: null,
      user: {
        id: "user-verified",
        email: "verified@example.com",
        emailVerifiedAt: null,
      },
    });
    authRepository.consumeEmailActionToken.mockResolvedValue({
      userId: "user-verified",
      type: EmailActionType.EMAIL_VERIFICATION,
    });

    const result = await authService.verifyEmail(mockApp, "verify-token");

    expect(authRepository.markUserEmailVerified).toHaveBeenCalledWith("user-verified");
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "verified@example.com",
        subject: "Welcome to GPDerp",
      }),
    );
    expect(result).toEqual({ status: "verified" });
  });
});
