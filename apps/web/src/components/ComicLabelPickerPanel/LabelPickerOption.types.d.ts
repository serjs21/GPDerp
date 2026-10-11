import type { ComicLabelPickerSeedLabel } from "./ComicLabelPickerPanel";

export type LabelPickerOptionProps = {
  label: ComicLabelPickerSeedLabel;
  selected: boolean;
  disabled: boolean;
  onToggle: (label: ComicLabelPickerSeedLabel) => void;
};
