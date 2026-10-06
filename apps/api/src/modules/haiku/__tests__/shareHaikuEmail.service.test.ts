import { POSTCARD_BACK_CID, POSTCARD_FRONT_CID } from "../../../consts/postcard";

jest.mock("../../../agent", () => ({ runHaikuAgentStream: jest.fn() }));
jest.mock("../../../mocks/textStream", () => ({ runHaikuAgentStreamMock: jest.fn() }));

jest.mock("../haiku.repository", () => ({
  haikuRepository: { findFullById: jest.fn() },
}));

jest.mock("../../auth/repository", () => ({
  authRepository: { findAccountIdForUser: jest.fn(), findUserById: jest.fn() },
}));

jest.mock("../../email/mailService", () => ({
  mailService: { sendEmail: jest.fn() },
}));

import { haikuService } from "../haiku.service";

const { haikuRepository } = jest.requireMock("../haiku.repository") as {
  haikuRepository: { findFullById: jest.Mock };
};
const { authRepository } = jest.requireMock("../../auth/repository") as {
  authRepository: { findAccountIdForUser: jest.Mock; findUserById: jest.Mock };
};
const { mailService } = jest.requireMock("../../email/mailService") as {
  mailService: { sendEmail: jest.Mock };
};

const front = Buffer.from("front");
const backA = Buffer.from("back-a");
const backB = Buffer.from("back-b");

describe("haikuService.shareHaikuByEmailForUser postcard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    haikuRepository.findFullById.mockResolvedValue({
      accountId: "acc-1",
      title: "Old pond",
      body: "An old silent pond",
    });
    authRepository.findAccountIdForUser.mockResolvedValue("acc-1");
    authRepository.findUserById.mockResolvedValue({ userName: "aki", email: "aki@example.com" });
    mailService.sendEmail.mockResolvedValue(undefined);
  });

  it("sends each recipient the shared front and only their own back", async () => {
    const result = await haikuService.shareHaikuByEmailForUser({
      userId: "user-1",
      haikuId: "haiku-1",
      recipients: ["a@example.com", "b@example.com"],
      personalMessage: "hi",
      postcard: {
        front,
        backs: new Map([
          ["a@example.com", backA],
          ["b@example.com", backB],
        ]),
      },
    });

    expect(result).toEqual({ ok: true, sentCount: 2 });
    const byRecipient = new Map(
      mailService.sendEmail.mock.calls.map(([mail]) => [mail.to, mail.attachments]),
    );
    for (const [to, back] of [
      ["a@example.com", backA],
      ["b@example.com", backB],
    ] as const) {
      const attachments = byRecipient.get(to);
      expect(attachments.find((a: { cid: string }) => a.cid === POSTCARD_FRONT_CID).content).toBe(front);
      expect(attachments.find((a: { cid: string }) => a.cid === POSTCARD_BACK_CID).content).toBe(back);
    }
  });

  it("refuses to send when a recipient has no back image", async () => {
    const result = await haikuService.shareHaikuByEmailForUser({
      userId: "user-1",
      haikuId: "haiku-1",
      recipients: ["a@example.com", "b@example.com"],
      personalMessage: "",
      postcard: { front, backs: new Map([["a@example.com", backA]]) },
    });

    expect(result).toEqual({ ok: false, reason: "invalid_recipients" });
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });
});
