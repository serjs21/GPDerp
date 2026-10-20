-- CreateTable
CREATE TABLE "EmailChangeRevertToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "restoreEmail" TEXT NOT NULL,
    "changedToEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "EmailChangeRevertToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailChangeRevertToken_tokenHash_key" ON "EmailChangeRevertToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailChangeRevertToken_userId_idx" ON "EmailChangeRevertToken"("userId");

-- AddForeignKey
ALTER TABLE "EmailChangeRevertToken" ADD CONSTRAINT "EmailChangeRevertToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
