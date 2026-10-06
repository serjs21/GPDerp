import type { DevPurchaseMessage } from "./devPurchaseMessages";

export type PurchaseMessagePickerProps = {
  title: string;
  items: DevPurchaseMessage[] | null;
  error?: string;
  onPick: (item: DevPurchaseMessage) => void;
};
