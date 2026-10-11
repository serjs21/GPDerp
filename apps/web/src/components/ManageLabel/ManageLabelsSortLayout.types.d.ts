import type { ReactNode } from "react";
import type { LabelSortProps } from "@/components/LabelSort";
import type { LabelSortPlacement } from "./utils/mergeDisplayLabels";

export type ManageLabelsSortLayoutProps = {
  placement: LabelSortPlacement;
  sidePanelTarget: HTMLElement | null | undefined;
  sort: LabelSortProps["value"];
  onSortChange: LabelSortProps["onChange"];
  /** Create panel rendered next to the sort control. */
  children: ReactNode;
};
