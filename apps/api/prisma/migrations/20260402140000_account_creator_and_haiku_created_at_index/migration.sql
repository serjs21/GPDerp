-- AlterTable
ALTER TABLE "Account" ADD COLUMN "createdByUserId" UUID;

-- CreateIndex
CREATE INDEX "Account_createdByUserId_idx" ON "Account"("createdByUserId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex (newest-first scans for ORDER BY createdAt DESC)
CREATE INDEX "Haiku_createdAt_idx" ON "Haiku"("createdAt" DESC);
