-- CreateTable
CREATE TABLE "debug_auth_logs" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" UUID,
    "sessionId" UUID,
    "requestPath" TEXT,
    "method" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "tabId" TEXT,
    "detail" JSONB,

    CONSTRAINT "debug_auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "debug_auth_logs_createdAt_idx" ON "debug_auth_logs"("createdAt");

-- CreateIndex
CREATE INDEX "debug_auth_logs_reason_idx" ON "debug_auth_logs"("reason");

-- CreateIndex
CREATE INDEX "debug_auth_logs_userId_idx" ON "debug_auth_logs"("userId");
