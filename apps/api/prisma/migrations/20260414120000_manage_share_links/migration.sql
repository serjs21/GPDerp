-- Add denormalized haiku subject to speed list/search
ALTER TABLE "ShareLink"
ADD COLUMN "haikuSubject" TEXT NOT NULL DEFAULT '';

-- Backfill existing rows
UPDATE "ShareLink" AS s
SET "haikuSubject" = h."title"
FROM "Haiku" AS h
WHERE s."sharedHaikuId" = h."id";

CREATE INDEX "ShareLink_createdByUserId_createdAt_idx"
ON "ShareLink"("createdByUserId", "createdAt" DESC);

CREATE INDEX "ShareLink_createdByUserId_haikuSubject_idx"
ON "ShareLink"("createdByUserId", "haikuSubject");
