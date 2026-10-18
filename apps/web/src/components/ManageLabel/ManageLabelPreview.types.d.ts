import type { LabelDto } from "@/api/labels";

export type ManageLabelPreviewProps = {
  label: LabelDto;
  /** Connected haikus; shown in the title when the connections panel is hidden (narrow strip). */
  connectedTotal: number;
  onEdit: () => void;
};
