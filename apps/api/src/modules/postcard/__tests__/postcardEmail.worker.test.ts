import { POSTCARD_BACK_CID, POSTCARD_FRONT_CID } from "../../../consts/postcard";

jest.mock("../postcardBackRenderer", () => {
  class PostcardMessageTooLongError extends Error {}
  return { PostcardMessageTooLongError, renderPostcardBackPng: jest.fn() };
});

jest.mock("../postcardBatch.repository", () => ({
  postcardBatchRepository: { findForSend: jest.fn(), markSent: jest.fn(), markFailed: jest.fn() },
}));

jest.mock("../../email/mailService", () => ({
  mailService: { sendEmail: jest.fn() },
}));

import { processPostcardEmailDeadLetter, processPostcardEmailJob } from "../postcardEmail.worker";

const renderer = jest.requireMock("../postcardBackRenderer") as {
  PostcardMessageTooLongError: new (message?: string) => Error;
  renderPostcardBackPng: jest.Mock;
};
const { postcardBatchRepository } = jest.requireMock("../postcardBatch.repository") as {
  postcardBatchRepository: { findForSend: jest.Mock; markSent: jest.Mock; markFailed: jest.Mock };
};
const { mailService } = jest.requireMock("../../email/mailService") as {
  mailService: { sendEmail: jest.Mock };
};

const front = Buffer.from("front");
const back = Buffer.from("back");
const job = { batchId: "batch-1", recipient: "a@example.com" };
const batch = {
  id: "batch-1",
  haikuTitle: "Old pond",
  haikuBody: "An old silent pond",
  senderName: "Aki",
  senderEmail: "aki@example.com",
  message: "Wish you were here",
  frontPng: front,
};

describe("processPostcardEmailJob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    postcardBatchRepository.findForSend.mockResolvedValue(batch);
    renderer.renderPostcardBackPng.mockResolvedValue(back);
    mailService.sendEmail.mockResolvedValue(undefined);
  });

  it("renders the batch's back and sends it with the shared front", async () => {
    expect(await processPostcardEmailJob(job)).toBe("sent");

    expect(renderer.renderPostcardBackPng).toHaveBeenCalledWith({
      message: "Wish you were here",
      senderName: "Aki",
    });
    const mail = mailService.sendEmail.mock.calls[0][0];
    expect(mail.to).toBe("a@example.com");
    expect(mail.replyTo).toBe("aki@example.com");
    expect(mail.attachments.map((a: { cid: string }) => a.cid)).toEqual([POSTCARD_FRONT_CID, POSTCARD_BACK_CID]);
    expect(mail.attachments[1].content).toBe(back);
    expect(mail.html).toContain("cid:postcard-front");
    expect(postcardBatchRepository.markSent).toHaveBeenCalledWith("batch-1");
  });

  it("sends only the back when the batch has no front", async () => {
    postcardBatchRepository.findForSend.mockResolvedValue({ ...batch, frontPng: null });

    await processPostcardEmailJob(job);

    const mail = mailService.sendEmail.mock.calls[0][0];
    expect(mail.attachments.map((a: { cid: string }) => a.cid)).toEqual([POSTCARD_BACK_CID]);
    expect(mail.html).not.toContain("cid:postcard-front");
  });

  it("throws transient SMTP errors so pg-boss retries", async () => {
    mailService.sendEmail.mockRejectedValue(Object.assign(new Error("try later"), { responseCode: 421 }));

    await expect(processPostcardEmailJob(job)).rejects.toThrow("try later");
    expect(postcardBatchRepository.markSent).not.toHaveBeenCalled();
    expect(postcardBatchRepository.markFailed).not.toHaveBeenCalled();
  });

  it("throws network errors so pg-boss retries", async () => {
    mailService.sendEmail.mockRejectedValue(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }));

    await expect(processPostcardEmailJob(job)).rejects.toThrow("timeout");
  });

  it("retries SMTP auth failures (our credentials, not the recipient)", async () => {
    mailService.sendEmail.mockRejectedValue(
      Object.assign(new Error("Invalid login"), { code: "EAUTH", responseCode: 535 }),
    );

    await expect(processPostcardEmailJob(job)).rejects.toThrow("Invalid login");
    expect(postcardBatchRepository.markFailed).not.toHaveBeenCalled();
  });

  it("completes without retry on a permanent SMTP rejection", async () => {
    mailService.sendEmail.mockRejectedValue(Object.assign(new Error("no such user"), { responseCode: 550 }));

    expect(await processPostcardEmailJob(job)).toBe("failed_permanently");
    expect(postcardBatchRepository.markFailed).toHaveBeenCalledWith("batch-1");
  });

  it("completes without retry when the message cannot fit", async () => {
    renderer.renderPostcardBackPng.mockRejectedValue(new renderer.PostcardMessageTooLongError("too long"));

    expect(await processPostcardEmailJob(job)).toBe("failed_permanently");
    expect(mailService.sendEmail).not.toHaveBeenCalled();
    expect(postcardBatchRepository.markFailed).toHaveBeenCalledWith("batch-1");
  });

  it("drops the job when the batch no longer exists", async () => {
    postcardBatchRepository.findForSend.mockResolvedValue(null);

    expect(await processPostcardEmailJob(job)).toBe("failed_permanently");
    expect(renderer.renderPostcardBackPng).not.toHaveBeenCalled();
  });
});

describe("processPostcardEmailDeadLetter", () => {
  it("counts the recipient as failed", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    await processPostcardEmailDeadLetter(job);

    expect(postcardBatchRepository.markFailed).toHaveBeenCalledWith("batch-1");
  });
});
