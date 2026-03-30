-- CreateTable
CREATE TABLE "FailedLoginAttempt" (
    "id" UUID NOT NULL,
    "emailKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FailedLoginAttempt_emailKey_createdAt_idx" ON "FailedLoginAttempt"("emailKey", "createdAt");
