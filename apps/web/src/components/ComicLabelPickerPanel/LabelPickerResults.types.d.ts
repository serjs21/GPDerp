import type { UIEvent } from "react";
import type { ComicLabelPickerSeedLabel } from "./ComicLabelPickerPanel";
import type { LabelPickerOptionProps } from "./LabelPickerOption.types";

export type LabelPickerResultsProps = {
  loading: boolean;
  fetchingNextPage: boolean;
  labels: ComicLabelPickerSeedLabel[];
  selectedIdSet: Set<string>;
  disabledIdSet: Set<string>;
  onToggle: LabelPickerOptionProps["onToggle"];
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
