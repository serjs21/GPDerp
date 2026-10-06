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

jest.mock("../../postcard/postcardEmail.worker", () => ({
  processPostcardEmailJob: jest.fn(),
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
const { processPostcardEmailJob } = jest.requireMock("../../postcard/postcardEmail.worker") as {
  processPostcardEmailJob: jest.Mock;
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
    processPostcardEmailJob.mockResolvedValue("sent");
  });

  it("sends the first recipient inline and queues the rest", async () => {
    const result = await share();

    expect(result).toEqual({ ok: true, sentCount: 1, queuedCount: 1 });
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
    expect(processPostcardEmailJob).toHaveBeenCalledWith({ batchId: "batch-1", recipient: "a@example.com" });
    expect(enqueuePostcardEmails).toHaveBeenCalledWith("batch-1", ["b@example.com"]);
  });

  it("does not touch the queue for a single recipient", async () => {
    expect(await share({ recipients: ["a@example.com"] })).toEqual({ ok: true, sentCount: 1, queuedCount: 0 });
    expect(enqueuePostcardEmails).not.toHaveBeenCalled();
  });

  it.each([
    ["throws", () => processPostcardEmailJob.mockRejectedValue(new Error("smtp down"))],
    ["fails permanently", () => processPostcardEmailJob.mockResolvedValue("failed_permanently")],
  ])("reports send_failed and queues nothing when the first send %s", async (_label, arrange) => {
    arrange();
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    expect(await share()).toEqual({ ok: false, reason: "send_failed" });
    expect(enqueuePostcardEmails).not.toHaveBeenCalled();
    expect(postcardBatchRepository.deleteById).toHaveBeenCalledWith("batch-1");
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
