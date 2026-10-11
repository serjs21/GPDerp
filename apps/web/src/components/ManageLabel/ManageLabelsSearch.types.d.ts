import type { RefObject } from "react";
import type { ManageLabelsPanelProps } from "./ManageLabelsPanel";

export type ManageLabelsSearchProps = {
  variant: NonNullable<ManageLabelsPanelProps["searchVariant"]>;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
};
