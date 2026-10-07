import type { LabelSortProps } from "@/components/LabelSort";
import type { OrderDropdownCoverProps } from "@/components/OrderDropdownCover";

export type OrderSortValue = LabelSortProps["value"];

export type OrderDropdownProps = {
  value: OrderSortValue;
  onChange: LabelSortProps["onChange"];
  widthRem?: OrderDropdownCoverProps["widthRem"];
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};
