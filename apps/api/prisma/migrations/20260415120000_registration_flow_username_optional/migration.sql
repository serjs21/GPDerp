-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SuspiciousRegistrationAttempt" (
    "id" UUID NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "countryCode" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "matchedUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspiciousRegistrationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuspiciousRegistrationAttempt_normalizedEmail_createdAt_idx" ON "SuspiciousRegistrationAttempt"("normalizedEmail", "createdAt");

-- AddForeignKey
ALTER TABLE "SuspiciousRegistrationAttempt" ADD CONSTRAINT "SuspiciousRegistrationAttempt_matchedUserId_fkey" FOREIGN KEY ("matchedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
