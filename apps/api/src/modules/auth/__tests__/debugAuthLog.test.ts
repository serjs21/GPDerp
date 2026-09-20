import { isDebugAuthLoggingEnabled, recordDebugAuthLog } from "../debugAuthLog";

jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    debugAuthLog: {
      create: jest.fn(),
    },
  },
}));

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: { debugAuthLog: { create: jest.Mock } };
};

describe("isDebugAuthLoggingEnabled", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("is true when NODE_ENV is not production", () => {
    process.env = { ...originalEnv, NODE_ENV: "development", DEBUG_AUTH_LOGS: undefined };
    expect(isDebugAuthLoggingEnabled(process.env)).toBe(true);
  });

  it("is false in production unless DEBUG_AUTH_LOGS=true", () => {
    process.env = { ...originalEnv, NODE_ENV: "production", DEBUG_AUTH_LOGS: undefined };
    expect(isDebugAuthLoggingEnabled(process.env)).toBe(false);
    process.env = { ...originalEnv, NODE_ENV: "production", DEBUG_AUTH_LOGS: "true" };
    expect(isDebugAuthLoggingEnabled(process.env)).toBe(true);
  });

  it("respects DEBUG_AUTH_LOGS=false even outside production", () => {
    process.env = { ...originalEnv, NODE_ENV: "development", DEBUG_AUTH_LOGS: "false" };
    expect(isDebugAuthLoggingEnabled(process.env)).toBe(false);
  });
});

describe("recordDebugAuthLog", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("no-ops when logging is disabled", async () => {
    process.env = { ...originalEnv, NODE_ENV: "production", DEBUG_AUTH_LOGS: undefined };
    await recordDebugAuthLog({
      source: "api",
      event: "refresh_rejected",
      reason: "refresh_token_invalid",
      message: "test",
    });
    expect(prismaClient.debugAuthLog.create).not.toHaveBeenCalled();
  });

  it("inserts a row when logging is enabled", async () => {
    process.env = { ...originalEnv, NODE_ENV: "development", DEBUG_AUTH_LOGS: undefined };
    prismaClient.debugAuthLog.create.mockResolvedValue({ id: "1" });
    await recordDebugAuthLog({
      source: "api",
      event: "refresh_rejected",
      reason: "refresh_token_reuse",
      message: "auth: refresh rejected — rotate status reused",
      userId: "11111111-1111-4111-8111-111111111111",
      sessionId: "22222222-2222-4222-8222-222222222222",
      detail: { rotateStatus: "reused" },
    });
    expect(prismaClient.debugAuthLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: "api",
        event: "refresh_rejected",
        reason: "refresh_token_reuse",
        message: "auth: refresh rejected — rotate status reused",
      }),
    });
  });
});
