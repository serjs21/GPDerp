-- CreateTable
CREATE TABLE "ShareLink" (
    "id" UUID NOT NULL,
    "shareHash" TEXT NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "sharedHaikuId" UUID NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_sharedHaikuId_fkey" FOREIGN KEY ("sharedHaikuId") REFERENCES "Haiku" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ShareLink_shareHash_key" ON "ShareLink"("shareHash");
CREATE INDEX "ShareLink_createdByUserId_idx" ON "ShareLink"("createdByUserId");
CREATE INDEX "ShareLink_createdAt_idx" ON "ShareLink"("createdAt");
