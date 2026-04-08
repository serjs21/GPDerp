-- CreateIndex
CREATE INDEX "Membership_userId_role_createdAt_idx"
ON "Membership"("userId", "role", "createdAt");

-- CreateIndex
CREATE INDEX "Label_accountId_createdAt_idx"
ON "Label"("accountId", "createdAt" DESC);
