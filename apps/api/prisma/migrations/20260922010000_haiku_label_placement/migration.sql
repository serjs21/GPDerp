-- Replace implicit M2M `_HaikuToLabel` with explicit `HaikuLabel` join
-- (connectionPointId + rotateDeg per haiku↔label link).

CREATE TABLE "HaikuLabel" (
    "haikuId" UUID NOT NULL,
    "labelId" UUID NOT NULL,
    "connectionPointId" TEXT NOT NULL DEFAULT 'bl',
    "rotateDeg" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HaikuLabel_pkey" PRIMARY KEY ("haikuId","labelId")
);

-- Copy existing links; assign connection points in fill order (bl, br, mr, tr, tl, ml).
WITH ranked AS (
  SELECT
    "A" AS "haikuId",
    "B" AS "labelId",
    (ROW_NUMBER() OVER (PARTITION BY "A" ORDER BY "B") - 1) AS rn
  FROM "_HaikuToLabel"
),
points AS (
  SELECT * FROM (VALUES
    (0, 'bl', -22::double precision),
    (1, 'br', 22::double precision),
    (2, 'mr', 0::double precision),
    (3, 'tr', -22::double precision),
    (4, 'tl', 22::double precision),
    (5, 'ml', 0::double precision)
  ) AS t(idx, point_id, rotate_deg)
)
INSERT INTO "HaikuLabel" ("haikuId", "labelId", "connectionPointId", "rotateDeg")
SELECT
  r."haikuId",
  r."labelId",
  p.point_id,
  p.rotate_deg
FROM ranked r
INNER JOIN points p ON p.idx = MOD(r.rn, 6);

DROP TABLE "_HaikuToLabel";

ALTER TABLE "HaikuLabel" ADD CONSTRAINT "HaikuLabel_haikuId_fkey"
  FOREIGN KEY ("haikuId") REFERENCES "Haiku"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HaikuLabel" ADD CONSTRAINT "HaikuLabel_labelId_fkey"
  FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "HaikuLabel_labelId_idx" ON "HaikuLabel"("labelId");
CREATE INDEX "HaikuLabel_haikuId_idx" ON "HaikuLabel"("haikuId");
