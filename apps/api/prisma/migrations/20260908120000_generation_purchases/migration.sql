-- CreateEnum
CREATE TYPE "GenerationPurchaseStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "generationCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GenerationPurchase" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "GenerationPurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "credits" INTEGER NOT NULL DEFAULT 100,
    "paddleTransactionId" TEXT,
    "paddleEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GenerationPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenerationPurchase_paddleTransactionId_key" ON "GenerationPurchase"("paddleTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationPurchase_paddleEventId_key" ON "GenerationPurchase"("paddleEventId");

-- CreateIndex
CREATE INDEX "GenerationPurchase_userId_status_idx" ON "GenerationPurchase"("userId", "status");

-- AddForeignKey
ALTER TABLE "GenerationPurchase" ADD CONSTRAINT "GenerationPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
