import Fastify from "fastify";
import { authPlugin } from "../auth.controller";
import { AUTH_CODES } from "../constants";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

jest.mock("../auth.service", () => ({
  authService: {
    registerManual: jest.fn(),
    loginManual: jest.fn(),
    loginGoogle: jest.fn(),
    loginGoogleForLoginFlow: jest.fn(),
    registerGoogleWithUsername: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
    resendVerification: jest.fn(),
    verifyEmail: jest.fn(),
    requestPasswordReset: jest.fn(),
    confirmPasswordReset: jest.fn(),
  },
}));

jest.mock("../tokenService", () => ({
  tokenService: {
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  },
}));

jest.mock("../repository", () => ({
  authRepository: {
    findActiveAuthSessionById: jest.fn(),
  },
}));

jest.mock("../debugAuthLog", () => ({
  isDebugAuthLoggingEnabled: jest.fn(() => true),
  recordDebugAuthLog: jest.fn(async () => undefined),
}));

const { authService } = jest.requireMock("../auth.service") as {
  authService: {
    verifyEmail: jest.Mock;
    loginGoogleForLoginFlow: jest.Mock;
    refresh: jest.Mock;
  };
};

const { recordDebugAuthLog } = jest.requireMock("../debugAuthLog") as {
  recordDebugAuthLog: jest.Mock;
};

const { tokenService } = jest.requireMock("../tokenService") as {
  tokenService: { clearAuthCookies: jest.Mock; setAuthCookies: jest.Mock };
};

describe("auth.controller", () => {
  const originalClientUrl = process.env.CLIENT_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLIENT_URL = "http://localhost:3000";
  });

  afterAll(() => {
    process.env.CLIENT_URL = originalClientUrl;
  });

  const buildApp = async () => {
    const app = Fastify();
    await app.register(authPlugin);
    return app;
  };

  it("returns verification status on successful verification", async () => {
    authService.verifyEmail.mockResolvedValue({ status: "verified" });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/auth/verify-email?token=ok-token",
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: { status: "verified" },
    });
    await app.close();
  });

  it("returns 400 when verification token is missing", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/auth/verify-email",
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
    await app.close();
  });

  it("returns 409 with profile when google login requires signup", async () => {
    authService.loginGoogleForLoginFlow.mockResolvedValue({
      status: "signup_required",
      profile: {
        email: "new.user@example.com",
        firstName: "New",
        lastName: "User",
        avatar: "https://avatar.example/new-user.png",
      },
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/google/login",
      payload: { token: "google-token" },
    });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.code).toBe(AUTH_CODES.GOOGLE_SIGNUP_REQUIRED);
    expect(body.data).toEqual({
      email: "new.user@example.com",
      firstName: "New",
      lastName: "User",
      avatar: "https://avatar.example/new-user.png",
    });
    await app.close();
  });

  it("records a debug auth log when refresh cookie is missing", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: {
        cookie: "csrf_token=test-csrf",
        "x-csrf-token": "test-csrf",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(tokenService.clearAuthCookies).toHaveBeenCalled();
    expect(recordDebugAuthLog).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "api",
        event: "cookies_cleared",
        reason: "refresh_cookie_missing",
      }),
      expect.anything(),
    );
    await app.close();
  });

  it("accepts client debug auth log posts when enabled", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/debug-auth-log",
      payload: {
        reason: "refresh_failed",
        message: "auth: refreshAuthSession failed after API 401",
        event: "client_auth_required",
        detail: { originalUrl: "/haiku" },
      },
    });

    expect(response.statusCode).toBe(204);
    expect(recordDebugAuthLog).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "web",
        reason: "refresh_failed",
        event: "client_auth_required",
      }),
      expect.anything(),
    );
    await app.close();
  });
});
