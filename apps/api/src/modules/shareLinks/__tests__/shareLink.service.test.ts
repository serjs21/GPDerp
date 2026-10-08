jest.mock("../../../env", () => ({
  env: { WEB_APP_URL: "https://example.com" },
}));

jest.mock("../../haiku/haiku.repository", () => ({
  haikuRepository: {
    findFullById: jest.fn(),
  },
}));

jest.mock("../../auth/repository", () => ({
  authRepository: {
    findAccountIdForUser: jest.fn(),
  },
}));

jest.mock("../shareLink.repository", () => ({
  shareLinkRepository: {
    findById: jest.fn(),
    findBySharedHaikuId: jest.fn(),
    findByShareHash: jest.fn(),
    create: jest.fn(),
    updateDisabledById: jest.fn(),
    updateShowLabelsById: jest.fn(),
    markDeactivatedById: jest.fn(),
  },
}));

jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
  },
}));

const { shareLinkRepository } = jest.requireMock("../shareLink.repository") as {
  shareLinkRepository: {
    findById: jest.Mock;
    findBySharedHaikuId: jest.Mock;
    findByShareHash: jest.Mock;
    create: jest.Mock;
    updateDisabledById: jest.Mock;
    updateShowLabelsById: jest.Mock;
    markDeactivatedById: jest.Mock;
  };
};

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: { $transaction: jest.Mock };
};

const { haikuRepository } = jest.requireMock("../../haiku/haiku.repository") as {
  haikuRepository: { findFullById: jest.Mock };
};

const { authRepository } = jest.requireMock("../../auth/repository") as {
  authRepository: { findAccountIdForUser: jest.Mock };
};

import { shareLinkService } from "../shareLink.service";

describe("shareLinkService.setShareLinkDisabled", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects enabling when limits are reached", async () => {
    shareLinkRepository.findById.mockResolvedValue({
      id: "link-1",
      createdByUserId: "user-1",
      expirationDate: new Date("2020-01-01T00:00:00.000Z"),
      maxViews: null,
      viewCount: 0,
      disabled: true,
    });

    const result = await shareLinkService.setShareLinkDisabled({
      userId: "user-1",
      shareLinkId: "link-1",
      disabled: false,
    });

    expect(result).toEqual({ ok: false, reason: "limits_reached" });
    expect(shareLinkRepository.updateDisabledById).not.toHaveBeenCalled();
  });

  it("updates disabled flag for creator", async () => {
    const updatedRow = {
      id: "link-1",
      shareHash: "abc",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: true,
      sharedHaikuId: "haiku-1",
      haikuSubject: "Morning mist",
    };

    shareLinkRepository.findById.mockResolvedValue({
      id: "link-1",
      createdByUserId: "user-1",
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: false,
    });
    shareLinkRepository.updateDisabledById.mockResolvedValue(updatedRow);

    const result = await shareLinkService.setShareLinkDisabled({
      userId: "user-1",
      shareLinkId: "link-1",
      disabled: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.shareLink.disabled).toBe(true);
      expect(result.shareLink.shareUrl).toBe("https://example.com/share/abc");
      expect(result.shareLink.sharedHaikuId).toBe("haiku-1");
    }
    expect(shareLinkRepository.updateDisabledById).toHaveBeenCalledWith({
      id: "link-1",
      disabled: true,
      deactivationReason: "manual",
    });
  });
});

describe("shareLinkService.getShareLinkForHaiku", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when no link exists", async () => {
    haikuRepository.findFullById.mockResolvedValue({ id: "haiku-1", accountId: "acc-1", title: "T" });
    authRepository.findAccountIdForUser.mockResolvedValue({ accountId: "acc-1" });
    shareLinkRepository.findBySharedHaikuId.mockResolvedValue(null);

    const result = await shareLinkService.getShareLinkForHaiku({
      userId: "user-1",
      haikuId: "haiku-1",
    });

    expect(result).toEqual({ ok: true, shareLink: null });
  });

  it("returns existing link", async () => {
    haikuRepository.findFullById.mockResolvedValue({ id: "haiku-1", accountId: "acc-1", title: "T" });
    authRepository.findAccountIdForUser.mockResolvedValue({ accountId: "acc-1" });
    shareLinkRepository.findBySharedHaikuId.mockResolvedValue({
      id: "link-1",
      shareHash: "abc",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: false,
      sharedHaikuId: "haiku-1",
      haikuSubject: "T",
      createdByUserId: "user-1",
    });

    const result = await shareLinkService.getShareLinkForHaiku({
      userId: "user-1",
      haikuId: "haiku-1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.shareLink?.id).toBe("link-1");
      expect(result.shareLink?.shareUrl).toBe("https://example.com/share/abc");
    }
  });
});

describe("shareLinkService.createShareLink get-or-create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns existing link without creating", async () => {
    haikuRepository.findFullById.mockResolvedValue({ id: "haiku-1", accountId: "acc-1", title: "T" });
    authRepository.findAccountIdForUser.mockResolvedValue({ accountId: "acc-1" });
    shareLinkRepository.findBySharedHaikuId.mockResolvedValue({
      id: "link-existing",
      shareHash: "exist",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: null,
      viewCount: 2,
      disabled: true,
      sharedHaikuId: "haiku-1",
      haikuSubject: "T",
      createdByUserId: "user-1",
    });

    const result = await shareLinkService.createShareLink({
      userId: "user-1",
      haikuId: "haiku-1",
      expirationDate: null,
      maxViews: null,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.created).toBe(false);
      expect(result.shareLink.id).toBe("link-existing");
    }
    expect(shareLinkRepository.create).not.toHaveBeenCalled();
  });

  it("creates permanent link when none exists", async () => {
    haikuRepository.findFullById.mockResolvedValue({ id: "haiku-1", accountId: "acc-1", title: "T" });
    authRepository.findAccountIdForUser.mockResolvedValue({ accountId: "acc-1" });
    shareLinkRepository.findBySharedHaikuId.mockResolvedValue(null);
    shareLinkRepository.findByShareHash.mockResolvedValue(null);
    shareLinkRepository.create.mockResolvedValue({
      id: "link-new",
      shareHash: "newhash",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: false,
      sharedHaikuId: "haiku-1",
      haikuSubject: "T",
    });

    const result = await shareLinkService.createShareLink({
      userId: "user-1",
      haikuId: "haiku-1",
      expirationDate: null,
      maxViews: null,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.created).toBe(true);
      expect(result.shareLink.id).toBe("link-new");
      expect(result.shareLink.sharedHaikuId).toBe("haiku-1");
    }
    expect(shareLinkRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sharedHaikuId: "haiku-1",
        expirationDate: null,
        maxViews: null,
      }),
    );
  });
});

describe("shareLinkService.resolveSharedHaiku snapshots", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a timeout snapshot after auto-deactivate", async () => {
    shareLinkRepository.findByShareHash.mockResolvedValue({
      id: "link-1",
      shareHash: "abc",
      createdByUserId: "user-1",
      sharedHaikuId: "haiku-1",
      haikuSubject: "Mist",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: new Date("2020-01-01T00:00:00.000Z"),
      maxViews: null,
      viewCount: 0,
      disabled: false,
      deactivationReason: null,
      createdBy: { userName: "Ada", firstName: "Ada", lastName: "L", email: "ada@example.com" },
    });
    shareLinkRepository.markDeactivatedById.mockResolvedValue({
      id: "link-1",
      shareHash: "abc",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: new Date("2020-01-01T00:00:00.000Z"),
      maxViews: null,
      viewCount: 0,
      disabled: true,
      deactivationReason: "timeout",
      sharedHaikuId: "haiku-1",
      haikuSubject: "Mist",
    });

    const result = await shareLinkService.resolveSharedHaiku("abc");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.createdByUserId).toBe("user-1");
      expect(result.shareLink?.disabled).toBe(true);
      expect(result.shareLink?.deactivationReason).toBe("timeout");
    }
  });

  it("returns a limit-reached snapshot after auto-deactivate", async () => {
    shareLinkRepository.findByShareHash.mockResolvedValue({
      id: "link-1",
      shareHash: "abc",
      createdByUserId: "user-1",
      sharedHaikuId: "haiku-1",
      haikuSubject: "Mist",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: 2,
      viewCount: 2,
      disabled: false,
      deactivationReason: null,
      createdBy: { userName: "Ada", firstName: "Ada", lastName: "L", email: "ada@example.com" },
    });
    shareLinkRepository.markDeactivatedById.mockResolvedValue({
      id: "link-1",
      shareHash: "abc",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: 2,
      viewCount: 2,
      disabled: true,
      deactivationReason: "limit_reached",
      sharedHaikuId: "haiku-1",
      haikuSubject: "Mist",
    });

    const result = await shareLinkService.resolveSharedHaiku("abc");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.shareLink?.deactivationReason).toBe("limit_reached");
      expect(result.createdByUserId).toBe("user-1");
    }
  });
});

describe("shareLinkService.setShowLabels", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects non-owners", async () => {
    shareLinkRepository.findById.mockResolvedValue({ id: "link-1", createdByUserId: "owner" });

    const result = await shareLinkService.setShowLabels({
      userId: "someone-else",
      shareLinkId: "link-1",
      showLabels: false,
    });

    expect(result).toEqual({ ok: false, reason: "forbidden" });
    expect(shareLinkRepository.updateShowLabelsById).not.toHaveBeenCalled();
  });

  it("updates the flag for the creator", async () => {
    shareLinkRepository.findById.mockResolvedValue({ id: "link-1", createdByUserId: "user-1" });
    shareLinkRepository.updateShowLabelsById.mockResolvedValue({
      id: "link-1",
      shareHash: "abc",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: false,
      showLabels: false,
      sharedHaikuId: "haiku-1",
      haikuSubject: "Mist",
    });

    const result = await shareLinkService.setShowLabels({
      userId: "user-1",
      shareLinkId: "link-1",
      showLabels: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.shareLink.showLabels).toBe(false);
    expect(shareLinkRepository.updateShowLabelsById).toHaveBeenCalledWith({
      id: "link-1",
      showLabels: false,
    });
  });
});

describe("shareLinkService.resolveSharedHaiku labels", () => {
  const baseRow = {
    id: "link-1",
    shareHash: "abc",
    createdByUserId: "user-1",
    sharedHaikuId: "haiku-1",
    haikuSubject: "Mist",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    expirationDate: null,
    maxViews: null,
    viewCount: 0,
    disabled: false,
    deactivationReason: null,
    createdBy: { userName: "Ada", firstName: "Ada", lastName: "L", email: "ada@example.com" },
  };
  const haikuRow = {
    id: "haiku-1",
    title: "Mist",
    titleSuffix: 0,
    body: "a\nb\nc",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    accountId: "acc-1",
    createdById: "user-1",
    labels: [{ id: "label-1", name: "Calm" }],
  };

  const mockResolve = (showLabels: boolean) => {
    shareLinkRepository.findByShareHash.mockResolvedValue({ ...baseRow, showLabels });
    prismaClient.$transaction.mockResolvedValue({ ...baseRow, showLabels, viewCount: 1 });
    haikuRepository.findFullById.mockResolvedValue(haikuRow);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps labels when showLabels is on", async () => {
    mockResolve(true);
    const result = await shareLinkService.resolveSharedHaiku("abc");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.showLabels).toBe(true);
      expect(result.haiku.labels).toHaveLength(1);
    }
  });

  it("does not count the creator's own visit", async () => {
    mockResolve(true);
    const result = await shareLinkService.resolveSharedHaiku("abc", { viewerUserId: "user-1" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.shareLink.viewCount).toBe(0);
    expect(prismaClient.$transaction).not.toHaveBeenCalled();
  });

  it("counts visits from other users", async () => {
    mockResolve(true);
    const result = await shareLinkService.resolveSharedHaiku("abc", { viewerUserId: "user-2" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.shareLink.viewCount).toBe(1);
    expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
  });

  it("strips labels when showLabels is off", async () => {
    mockResolve(false);
    const result = await shareLinkService.resolveSharedHaiku("abc");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.showLabels).toBe(false);
      expect(result.haiku.labels).toEqual([]);
      expect(result.shareLink.showLabels).toBe(false);
    }
  });
});
