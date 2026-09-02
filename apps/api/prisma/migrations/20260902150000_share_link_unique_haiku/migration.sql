-- Keep the newest ShareLink per haiku; remove older duplicates before unique constraint.
DELETE FROM "ShareLink"
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY "sharedHaikuId"
             ORDER BY "createdAt" DESC, id DESC
           ) AS rn
    FROM "ShareLink"
  ) ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX "ShareLink_sharedHaikuId_key" ON "ShareLink"("sharedHaikuId");
