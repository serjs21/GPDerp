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
  },
}));

const { shareLinkRepository } = jest.requireMock("../shareLink.repository") as {
  shareLinkRepository: {
    findById: jest.Mock;
    findBySharedHaikuId: jest.Mock;
    findByShareHash: jest.Mock;
    create: jest.Mock;
    updateDisabledById: jest.Mock;
  };
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
