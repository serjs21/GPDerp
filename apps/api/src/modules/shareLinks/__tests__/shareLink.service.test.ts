jest.mock("../../../env", () => ({
  env: { WEB_APP_URL: "https://example.com" },
}));

jest.mock("../shareLink.repository", () => ({
  shareLinkRepository: {
    findById: jest.fn(),
    updateDisabledById: jest.fn(),
  },
}));

const { shareLinkRepository } = jest.requireMock("../shareLink.repository") as {
  shareLinkRepository: {
    findById: jest.Mock;
    updateDisabledById: jest.Mock;
  };
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
    }
    expect(shareLinkRepository.updateDisabledById).toHaveBeenCalledWith({
      id: "link-1",
      disabled: true,
    });
  });
});
