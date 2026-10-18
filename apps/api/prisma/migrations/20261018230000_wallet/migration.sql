-- CreateTable
CREATE TABLE "Wallet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "generationCredits" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Wallet_generationCredits_nonnegative" CHECK ("generationCredits" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one wallet per existing user, carrying the current balance.
INSERT INTO "Wallet" ("id", "userId", "generationCredits", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", GREATEST("generationCredits", 0), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "generationCredits";
