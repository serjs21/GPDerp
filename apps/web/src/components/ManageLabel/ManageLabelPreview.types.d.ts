import type { LabelDto } from "@/api/labels";

export type ManageLabelPreviewProps = {
  label: LabelDto;
  onEdit: () => void;
};
