-- Persist comic label silhouette preset id (classic, sharp, soft, circle, square, thought).
ALTER TABLE "Label" ADD COLUMN "shape" TEXT NOT NULL DEFAULT 'classic';
