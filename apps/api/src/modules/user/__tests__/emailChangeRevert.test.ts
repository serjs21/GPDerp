jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
    emailChangeRevertToken: { findUnique: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn() },
    userEmailChangeRequest: { upsert: jest.fn() },
  },
}));
jest.mock("../../auth/repository", () => ({
  authRepository: { revokeAllSessionsForUser: jest.fn(), findUserByEmail: jest.fn() },
}));
jest.mock("../../email/mailService", () => ({ mailService: { sendEmail: jest.fn() } }));
jest.mock("../../auth/tokenService", () => ({
  tokenService: {
    createRefreshToken: () => jest.requireActual("node:crypto").randomBytes(24).toString("base64url"),
  },
}));
jest.mock("../../auth/debugAuthLog", () => ({ recordDebugAuthLog: jest.fn() }));
jest.mock("../../auth/utils", () => ({
  ...jest.requireActual("../../auth/utils"),
  hashPassword: jest.fn().mockResolvedValue("disabled-hash"),
}));

import { EmailActionType } from "../../../generated/prisma";
import { authRepository } from "../../auth/repository";
import { hashToken } from "../../auth/utils";
import { mailService } from "../../email/mailService";
import { EMAIL_CHANGE_REVERT_TTL_MS, userService } from "../user.service";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: {
    $transaction: jest.Mock;
    emailChangeRevertToken: { findUnique: jest.Mock; updateMany: jest.Mock; create: jest.Mock };
    user: { findUnique: jest.Mock };
    userEmailChangeRequest: { upsert: jest.Mock };
  };
};
const revokeAll = authRepository.revokeAllSessionsForUser as jest.Mock;
const findUserByEmail = authRepository.findUserByEmail as jest.Mock;
const sendEmail = mailService.sendEmail as jest.Mock;

const DAY_MS = 24 * 60 * 60 * 1000;
const tokenRow = (overrides: Record<string, unknown> = {}) => ({
  id: "revert-1",
  userId: "user-1",
  restoreEmail: "owner@example.com",
  changedToEmail: "attacker@example.com",
  usedAt: null,
  expiresAt: new Date(Date.now() + DAY_MS),
  ...overrides,
});

function makeTx(options: { email: string; hasPassword: boolean; occupantId?: string }) {
  const tx = {
    userEmailChangeRequest: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    emailChangeRevertToken: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    emailActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn() },
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValueOnce({ email: options.email, passwordCredential: options.hasPassword ? { id: "pc" } : null })
        .mockResolvedValueOnce(options.occupantId ? { id: options.occupantId } : null),
      update: jest.fn(),
    },
    passwordCredential: { update: jest.fn() },
  };
  prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => unknown) => cb(tx));
  return tx;
}

beforeEach(() => {
  jest.clearAllMocks();
  prismaClient.emailChangeRevertToken.updateMany.mockResolvedValue({ count: 1 });
});

describe("previewEmailChangeRevert", () => {
  it("describes a valid link without consuming it", async () => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(tokenRow());

    await expect(userService.previewEmailChangeRevert("raw")).resolves.toEqual({
      status: "valid",
      restoreEmail: "owner@example.com",
      changedToEmail: "attacker@example.com",
    });
    expect(prismaClient.emailChangeRevertToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken("raw") },
    });
    expect(prismaClient.emailChangeRevertToken.updateMany).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid", null],
    ["used", tokenRow({ usedAt: new Date() })],
    ["expired", tokenRow({ expiresAt: new Date(Date.now() - 1000) })],
  ])("reports %s links", async (status, row) => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(row);
    await expect(userService.previewEmailChangeRevert("raw")).resolves.toEqual({ status });
  });
});

describe("revertEmailChange", () => {
  it("restores the old email, burns every token, disables the password and signs everyone out", async () => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(tokenRow());
    const tx = makeTx({ email: "attacker@example.com", hasPassword: true });

    const result = await userService.revertEmailChange("raw");

    expect(result).toMatchObject({ status: "reverted", restoredEmail: "owner@example.com" });
    expect(result).toHaveProperty("passwordResetToken", expect.any(String));
    expect(prismaClient.emailChangeRevertToken.updateMany).toHaveBeenCalledWith({
      where: { id: "revert-1", usedAt: null, expiresAt: { gt: expect.any(Date) } },
      data: { usedAt: expect.any(Date) },
    });
    expect(tx.userEmailChangeRequest.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", consumedAt: null, invalidatedAt: null },
      data: { invalidatedAt: expect.any(Date) },
    });
    expect(tx.emailChangeRevertToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(tx.emailActionToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", usedAt: null, invalidatedAt: null },
      data: { invalidatedAt: expect.any(Date) },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { email: "owner@example.com", emailVerifiedAt: expect.any(Date) },
    });
    expect(tx.passwordCredential.update).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      data: { passwordHash: "disabled-hash" },
    });
    const resetToken = (result as { passwordResetToken: string }).passwordResetToken;
    expect(tx.emailActionToken.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: EmailActionType.PASSWORD_RESET,
        tokenHash: hashToken(resetToken),
        expiresAt: expect.any(Date),
      },
    });
    expect(revokeAll).toHaveBeenCalledWith("user-1", "email_change_reverted");
  });

  it("cancels a still-pending change without touching the email", async () => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(tokenRow());
    const tx = makeTx({ email: "owner@example.com", hasPassword: true });

    await expect(userService.revertEmailChange("raw")).resolves.toMatchObject({ status: "reverted" });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(revokeAll).toHaveBeenCalled();
  });

  it("still secures the account when the old address was taken meanwhile", async () => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(tokenRow());
    const tx = makeTx({ email: "attacker@example.com", hasPassword: true, occupantId: "someone-else" });

    await expect(userService.revertEmailChange("raw")).resolves.toMatchObject({ status: "email_taken" });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.passwordCredential.update).toHaveBeenCalled();
    expect(revokeAll).toHaveBeenCalled();
  });

  it("skips the password step for accounts without a password", async () => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(tokenRow());
    const tx = makeTx({ email: "attacker@example.com", hasPassword: false });

    const result = await userService.revertEmailChange("raw");

    expect(result).not.toHaveProperty("passwordResetToken");
    expect(tx.passwordCredential.update).not.toHaveBeenCalled();
    expect(tx.emailActionToken.create).not.toHaveBeenCalled();
    expect(revokeAll).toHaveBeenCalled();
  });

  it.each([
    ["invalid", null],
    ["used", tokenRow({ usedAt: new Date() })],
    ["expired", tokenRow({ expiresAt: new Date(Date.now() - 1000) })],
  ])("rejects %s links without side effects", async (status, row) => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(row);

    await expect(userService.revertEmailChange("raw")).resolves.toEqual({ status });
    expect(prismaClient.$transaction).not.toHaveBeenCalled();
    expect(revokeAll).not.toHaveBeenCalled();
  });

  it("loses a race against a concurrent click", async () => {
    prismaClient.emailChangeRevertToken.findUnique.mockResolvedValue(tokenRow());
    prismaClient.emailChangeRevertToken.updateMany.mockResolvedValue({ count: 0 });

    await expect(userService.revertEmailChange("raw")).resolves.toEqual({ status: "used" });
    expect(prismaClient.$transaction).not.toHaveBeenCalled();
  });
});

describe("createEmailChangeRequest", () => {
  it("stores a 7-day revert token and links it from the old-address alert", async () => {
    prismaClient.user.findUnique.mockResolvedValue({ id: "user-1", email: "owner@example.com", authIdentities: [] });
    findUserByEmail.mockResolvedValue(null);

    await userService.createEmailChangeRequest({ userId: "user-1", nextEmailRaw: "new@example.com" });

    const created = prismaClient.emailChangeRevertToken.create.mock.calls[0][0].data;
    expect(created).toMatchObject({
      userId: "user-1",
      restoreEmail: "owner@example.com",
      changedToEmail: "new@example.com",
    });
    const ttl = created.expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(EMAIL_CHANGE_REVERT_TTL_MS - 60_000);
    expect(ttl).toBeLessThanOrEqual(EMAIL_CHANGE_REVERT_TTL_MS);

    const confirmation = sendEmail.mock.calls.find(([message]) => message.to === "new@example.com")![0];
    expect(confirmation.text).toContain("from owner@example.com to this one");
    expect(confirmation.html).toContain("<strong>owner@example.com</strong>");

    const alert = sendEmail.mock.calls.find(([message]) => message.to === "owner@example.com")![0];
    const linkToken = new URL(/https?:\/\/\S+revert-email-change\?revertToken=[^\s"]+/.exec(alert.text)![0]).searchParams.get("revertToken")!;
    expect(hashToken(linkToken)).toBe(created.tokenHash);
    expect(alert.html).toContain(`revert-email-change?revertToken=${encodeURIComponent(linkToken)}`);
  });
});
