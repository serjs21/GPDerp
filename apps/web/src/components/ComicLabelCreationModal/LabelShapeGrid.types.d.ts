import type { ComicLabelShapeId } from "./comicLabelShapes";

export type LabelShapeGridProps = {
  shapeId: ComicLabelShapeId;
  color: string;
  onShapeChange: (shapeId: ComicLabelShapeId) => void;
};
