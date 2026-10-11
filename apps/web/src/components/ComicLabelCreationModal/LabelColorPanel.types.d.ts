export type LabelColorPanelProps = {
  color: string;
  onColorChange: (color: string) => void;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
};
