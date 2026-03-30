import { EmailActionType } from "../../../generated/prisma";
import { authService } from "../auth.service";
import { hashPassword } from "../utils";

jest.mock("../repository", () => ({
  authRepository: {
    findUserByEmail: jest.fn(),
    findUserByUserName: jest.fn(),
    findGoogleIdentityByProviderAccountId: jest.fn(),
    createUserWithWorkspace: jest.fn(),
    attachManualAuth: jest.fn(),
    createSession: jest.fn(),
    createRefreshToken: jest.fn(),
    invalidateEmailActionTokens: jest.fn(),
    createEmailActionToken: jest.fn(),
    attachGoogleIdentity: jest.fn(),
    markUserEmailVerified: jest.fn(),
    findRefreshTokenByHash: jest.fn(),
    rotateRefreshTokenAtomic: jest.fn(),
    revokeSession: jest.fn(),
    consumeEmailActionToken: jest.fn(),
    updatePassword: jest.fn(),
    revokeAllSessionsForUser: jest.fn(),
    findUserById: jest.fn(),
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

jest.mock("../mailService", () => ({
  mailService: {
    sendEmail: jest.fn(),
  },
}));

jest.mock("../tokenService", () => ({
  tokenService: {
    sessionExpiresAt: jest.fn(() => new Date("2030-01-01T00:00:00.000Z")),
    refreshExpiresAt: jest.fn(() => new Date("2030-01-01T00:10:00.000Z")),
    createRefreshToken: jest.fn(() => "raw-refresh-token"),
    createAccessToken: jest.fn(() => "access-token"),
  },
}));

const { authRepository } = jest.requireMock("../repository") as any;
const { googleService } = jest.requireMock("../googleService") as any;
const { mailService } = jest.requireMock("../mailService") as any;

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
  headers: { "user-agent": "jest-test-agent" },
} as any;

const setupSessionMocks = () => {
  authRepository.createSession.mockResolvedValue({ id: "session-1", userId: "user-1" });
  authRepository.createRefreshToken.mockResolvedValue({ id: "rt-1" });
  authRepository.countFailedLoginAttemptsSince.mockResolvedValue(0);
  authRepository.clearFailedLoginAttemptsForEmail.mockResolvedValue({ count: 0 });
};

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSessionMocks();
  });

  it("registers a manual user successfully", async () => {
    authRepository.findUserByEmail.mockResolvedValue(null);
    authRepository.createUserWithWorkspace.mockResolvedValue({ id: "user-1" });

    const result = await authService.registerManual(mockApp, mockRequest, {
      email: "NEW@EXAMPLE.COM",
      password: "password123",
      userName: "new_user",
      firstName: "New",
      lastName: "User",
    });

    expect(authRepository.createUserWithWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@example.com",
        userName: "new_user",
        provider: "LOCAL",
      }),
    );
    expect(authRepository.createEmailActionToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: EmailActionType.EMAIL_VERIFICATION,
      }),
    );
    expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "raw-refresh-token",
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

  it("prevents password registration when email already exists", async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      passwordCredential: { passwordHash: "existing" },
      authIdentities: [],
    });

    await expect(
      authService.registerManual(mockApp, mockRequest, {
        email: "user@example.com",
        password: "password123",
        userName: "someone",
      }),
    ).rejects.toThrow("An account with this email already exists");
  });

  it("rejects password registration for google-only email", async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-google-only",
      passwordCredential: null,
      authIdentities: [{ provider: "GOOGLE" }],
    });

    await expect(
      authService.registerManual(mockApp, mockRequest, {
        email: "google.only@example.com",
        password: "password123",
        userName: "someone",
      }),
    ).rejects.toThrow("An account with this email already exists");
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

    expect(authRepository.invalidateEmailActionTokens).toHaveBeenCalledWith({
      userId: "user-1",
      type: EmailActionType.EMAIL_VERIFICATION,
    });
    expect(authRepository.createEmailActionToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: EmailActionType.EMAIL_VERIFICATION,
      }),
    );
    expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
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
      reused: false,
      nextToken: { id: "rt-2" },
    });

    const result = await authService.refresh(mockApp, "presented-token");
    expect(authRepository.rotateRefreshTokenAtomic).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "raw-refresh-token",
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
      reused: true,
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
});
