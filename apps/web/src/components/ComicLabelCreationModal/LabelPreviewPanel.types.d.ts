import type { RefObject } from "react";
import type { ComicLabelShapePreset } from "./comicLabelShapes";

export type LabelPreviewPanelProps = {
  name: string;
  trimmedName: string;
  color: string;
  shape: ComicLabelShapePreset;
  nameInputRef: RefObject<HTMLInputElement | null>;
  onNameChange: (name: string) => void;
};
