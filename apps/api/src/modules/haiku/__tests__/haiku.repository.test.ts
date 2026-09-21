jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
  },
}));

jest.mock("../../payments/payments.repository", () => ({
  trySpendGenerationCreditWithTx: jest.fn(),
}));

import { trySpendGenerationCreditWithTx } from "../../payments/payments.repository";
import { haikuRepository } from "../haiku.repository";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: { $transaction: jest.Mock };
};

const mockedSpend = trySpendGenerationCreditWithTx as jest.MockedFunction<typeof trySpendGenerationCreditWithTx>;

const haikuRow = {
  id: "haiku-1",
  title: "Morning mist",
  titleSuffix: 0,
  body: "a haiku body",
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  accountId: "account-1",
  createdById: "user-1",
  haikuLabels: [],
};

const haikuPayload = {
  id: "haiku-1",
  title: "Morning mist",
  titleSuffix: 0,
  body: "a haiku body",
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  accountId: "account-1",
  createdById: "user-1",
  labels: [],
};

describe("haikuRepository.createFromGeneration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("spends one credit and inserts the haiku in one transaction", async () => {
    const tx = {
      haiku: {
        aggregate: jest.fn().mockResolvedValue({ _max: { titleSuffix: -1 } }),
        create: jest.fn().mockResolvedValue(haikuRow),
      },
    };
    mockedSpend.mockResolvedValue({ ok: true, creditsRemaining: 4 });
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    await expect(
      haikuRepository.createFromGeneration({
        accountId: "account-1",
        createdById: "user-1",
        subject: "Morning mist",
        body: "a haiku body",
      }),
    ).resolves.toEqual({
      ok: true,
      haiku: haikuPayload,
      creditsRemaining: 4,
    });

    expect(mockedSpend).toHaveBeenCalledWith(tx, "user-1", 1);
    expect(tx.haiku.create).toHaveBeenCalledTimes(1);
  });

  it("does not insert a haiku when spend fails", async () => {
    const tx = {
      haiku: {
        aggregate: jest.fn(),
        create: jest.fn(),
      },
    };
    mockedSpend.mockResolvedValue({ ok: false, reason: "insufficient" });
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    await expect(
      haikuRepository.createFromGeneration({
        accountId: "account-1",
        createdById: "user-1",
        subject: "Morning mist",
        body: "a haiku body",
      }),
    ).resolves.toEqual({ ok: false, reason: "insufficient" });

    expect(tx.haiku.create).not.toHaveBeenCalled();
  });
});
