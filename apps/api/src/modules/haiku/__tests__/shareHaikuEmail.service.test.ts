jest.mock("../../../agent", () => ({ runHaikuAgentStream: jest.fn() }));
jest.mock("../../../mocks/textStream", () => ({ runHaikuAgentStreamMock: jest.fn() }));

jest.mock("../haiku.repository", () => ({
  haikuRepository: { findFullById: jest.fn() },
}));

jest.mock("../../auth/repository", () => ({
  authRepository: { findAccountIdForUser: jest.fn(), findUserById: jest.fn() },
}));

jest.mock("../../postcard/postcardBatch.repository", () => ({
  postcardBatchRepository: { create: jest.fn(), deleteById: jest.fn() },
}));

jest.mock("../../postcard/postcardQueue", () => ({
  enqueuePostcardEmails: jest.fn(),
}));

jest.mock("../../postcard/postcardTextWrap", () => ({
  postcardMessageFits: jest.fn(),
}));

import { haikuService } from "../haiku.service";

const { haikuRepository } = jest.requireMock("../haiku.repository") as {
  haikuRepository: { findFullById: jest.Mock };
};
const { authRepository } = jest.requireMock("../../auth/repository") as {
  authRepository: { findAccountIdForUser: jest.Mock; findUserById: jest.Mock };
};
const { postcardBatchRepository } = jest.requireMock("../../postcard/postcardBatch.repository") as {
  postcardBatchRepository: { create: jest.Mock; deleteById: jest.Mock };
};
const { enqueuePostcardEmails } = jest.requireMock("../../postcard/postcardQueue") as {
  enqueuePostcardEmails: jest.Mock;
};
const { postcardMessageFits } = jest.requireMock("../../postcard/postcardTextWrap") as {
  postcardMessageFits: jest.Mock;
};

const front = Buffer.from("front");
const share = (overrides: Partial<Parameters<typeof haikuService.shareHaikuByEmailForUser>[0]> = {}) =>
  haikuService.shareHaikuByEmailForUser({
    userId: "user-1",
    haikuId: "haiku-1",
    recipients: ["A@example.com", "b@example.com", "a@example.com"],
    personalMessage: " hi ",
    front,
    ...overrides,
  });

describe("haikuService.shareHaikuByEmailForUser (queued postcards)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    haikuRepository.findFullById.mockResolvedValue({
      accountId: "acc-1",
      title: "Old pond",
      body: "An old silent pond",
    });
    authRepository.findAccountIdForUser.mockResolvedValue("acc-1");
    authRepository.findUserById.mockResolvedValue({ userName: "aki", email: "aki@example.com" });
    postcardMessageFits.mockReturnValue(true);
    postcardBatchRepository.create.mockResolvedValue({ id: "batch-1" });
    enqueuePostcardEmails.mockImplementation(async (_id: string, recipients: string[]) => recipients.length);
  });

  it("stores one batch and enqueues one job per normalized recipient", async () => {
    const result = await share();

    expect(result).toEqual({ ok: true, queuedCount: 2 });
    expect(postcardBatchRepository.create).toHaveBeenCalledWith({
      userId: "user-1",
      haikuId: "haiku-1",
      haikuTitle: "Old pond",
      haikuBody: "An old silent pond",
      senderName: "aki",
      senderEmail: "aki@example.com",
      message: "hi",
      frontPng: front,
      recipientCount: 2,
    });
    expect(enqueuePostcardEmails).toHaveBeenCalledWith("batch-1", ["a@example.com", "b@example.com"]);
  });

  it("rejects a message that wraps past the postcard line limit", async () => {
    postcardMessageFits.mockReturnValue(false);

    expect(await share()).toEqual({ ok: false, reason: "message_too_long" });
    expect(postcardBatchRepository.create).not.toHaveBeenCalled();
  });

  it("deletes the batch and reports enqueue_failed when the queue rejects", async () => {
    enqueuePostcardEmails.mockRejectedValue(new Error("pg-boss down"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    expect(await share()).toEqual({ ok: false, reason: "enqueue_failed" });
    expect(postcardBatchRepository.deleteById).toHaveBeenCalledWith("batch-1");
  });

  it("rejects invalid recipients before touching the queue", async () => {
    expect(await share({ recipients: ["not-an-email"] })).toEqual({ ok: false, reason: "invalid_recipients" });
    expect(enqueuePostcardEmails).not.toHaveBeenCalled();
  });
});
