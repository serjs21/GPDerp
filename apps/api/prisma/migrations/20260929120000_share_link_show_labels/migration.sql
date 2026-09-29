-- Owner toggle: show haiku labels on the public share page.

ALTER TABLE "ShareLink" ADD COLUMN "showLabels" BOOLEAN NOT NULL DEFAULT true;
