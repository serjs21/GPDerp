-- Speed up token invalidation scans for a user's active tokens.
CREATE INDEX "EmailActionToken_userId_type_usedAt_invalidatedAt_idx"
ON "EmailActionToken"("userId", "type", "usedAt", "invalidatedAt");

-- Ensure provider linkage shape remains valid.
ALTER TABLE "AuthIdentity"
ADD CONSTRAINT "AuthIdentity_provider_account_shape_check"
CHECK (
  ("provider" = 'LOCAL' AND "providerAccountId" IS NULL)
  OR ("provider" = 'GOOGLE' AND "providerAccountId" IS NOT NULL)
);
