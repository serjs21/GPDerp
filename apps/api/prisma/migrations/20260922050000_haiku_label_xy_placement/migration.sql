-- Free-form LabelHalo placement on haiku↔label links.

ALTER TABLE "HaikuLabel" ADD COLUMN "xPercent" DOUBLE PRECISION NOT NULL DEFAULT 50;
ALTER TABLE "HaikuLabel" ADD COLUMN "yPercent" DOUBLE PRECISION NOT NULL DEFAULT 50;

-- Backfill from legacy connectionPointId (matches web seedPlacementFromConnectionPoint).
UPDATE "HaikuLabel" SET
  "xPercent" = CASE "connectionPointId"
    WHEN 'bl' THEN 0
    WHEN 'ml' THEN 0
    WHEN 'tl' THEN 0
    WHEN 'tr' THEN 100
    WHEN 'mr' THEN 100
    WHEN 'br' THEN 100
    ELSE 50
  END,
  "yPercent" = CASE "connectionPointId"
    WHEN 'bl' THEN 60
    WHEN 'ml' THEN 32
    WHEN 'tl' THEN 0
    WHEN 'tr' THEN 0
    WHEN 'mr' THEN 28
    WHEN 'br' THEN 62
    ELSE 50
  END;
