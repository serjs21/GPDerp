import type { Prisma } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";

/**
 * The only module allowed to write the Wallet table (enforced by `no-restricted-syntax` in eslint.config.mjs).
 * Other modules call these functions in-process; no client-facing route mutates a wallet.
 */

export type SpendGenerationCreditResult =
  | { ok: true; creditsRemaining: number }
  | { ok: false; reason: "insufficient" | "not_found" };

const assertPositiveAmount = (amount: number) => {
  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error("Credit amount must be a positive integer");
  }
};

/** `null` when the user has no wallet. */
export async function getGenerationCredits(userId: string): Promise<number | null> {
  const wallet = await prismaClient.wallet.findUnique({
    where: { userId },
    select: { generationCredits: true },
  });
  return wallet?.generationCredits ?? null;
}

/** Atomically debit credits when the balance is high enough; safe under concurrent generations. */
export async function trySpendGenerationCreditsWithTx(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
): Promise<SpendGenerationCreditResult> {
  assertPositiveAmount(amount);

  const claimed = await tx.wallet.updateMany({
    where: { userId, generationCredits: { gte: amount } },
    data: { generationCredits: { decrement: amount } },
  });
  const wallet = await tx.wallet.findUnique({
    where: { userId },
    select: { generationCredits: true },
  });
  if (!wallet) return { ok: false, reason: "not_found" };
  if (claimed.count !== 1) return { ok: false, reason: "insufficient" };
  return { ok: true, creditsRemaining: wallet.generationCredits };
}

/** Add credits (creating the wallet if missing); returns the new balance. */
export async function grantGenerationCreditsWithTx(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
): Promise<number> {
  assertPositiveAmount(amount);

  const wallet = await tx.wallet.upsert({
    where: { userId },
    create: { userId, generationCredits: amount },
    update: { generationCredits: { increment: amount } },
    select: { generationCredits: true },
  });
  return wallet.generationCredits;
}

export async function createWalletWithTx(
  tx: Prisma.TransactionClient,
  userId: string,
  initialCredits: number,
): Promise<void> {
  await tx.wallet.create({ data: { userId, generationCredits: initialCredits } });
}
