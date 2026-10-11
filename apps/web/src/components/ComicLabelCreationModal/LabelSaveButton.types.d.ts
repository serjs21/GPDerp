export type LabelSaveButtonProps = {
  mode: "create" | "edit";
  color: string;
  /** Tooltip explaining why saving is blocked; null when the draft is valid. */
  blockReason: string | null;
  busy: boolean;
  onSave: () => void;
};
