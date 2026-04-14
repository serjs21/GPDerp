ALTER TYPE "EmailActionType" ADD VALUE 'EMAIL_CHANGE';

ALTER TABLE "User"
ADD COLUMN "avatarManuallySet" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "UserEmailChangeRequest" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "oldEmail" TEXT NOT NULL,
  "newEmail" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "consumedAt" TIMESTAMP(3),
  "invalidatedAt" TIMESTAMP(3),
  CONSTRAINT "UserEmailChangeRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserEmailChangeRequest"
ADD CONSTRAINT "UserEmailChangeRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "UserEmailChangeRequest_userId_key" ON "UserEmailChangeRequest"("userId");
CREATE UNIQUE INDEX "UserEmailChangeRequest_tokenHash_key" ON "UserEmailChangeRequest"("tokenHash");
CREATE INDEX "UserEmailChangeRequest_expiresAt_idx" ON "UserEmailChangeRequest"("expiresAt");
