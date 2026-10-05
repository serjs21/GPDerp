export type PurchaseConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Server-provided copy (varies by the user's purchase count). */
  message: string;
};
