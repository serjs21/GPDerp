export type NoGenerationsLeftModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Server-provided copy (varies by the user's purchase count). */
  message: string;
  onBuy: () => void;
  buying?: boolean;
  buyDisabled?: boolean;
};
