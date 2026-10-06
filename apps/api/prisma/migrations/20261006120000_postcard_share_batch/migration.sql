-- CreateTable
CREATE TABLE "PostcardShareBatch" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "haikuId" UUID NOT NULL,
    "haikuTitle" TEXT NOT NULL,
    "haikuBody" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "frontPng" BYTEA,
    "recipientCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostcardShareBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostcardShareBatch_createdAt_idx" ON "PostcardShareBatch"("createdAt");

-- AddForeignKey
ALTER TABLE "PostcardShareBatch" ADD CONSTRAINT "PostcardShareBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
