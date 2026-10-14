import type { HaikuDto } from "@/api/haikus";
import type { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal/CreateAddLabelsModal";
import type { DeleteConfirmModalProps } from "@/components/DeleteConfirmModal";
import type { ShareModal } from "@/components/ShareModal/ShareModal";
import type { LazyDialog } from "@/hooks/useLazyDialog";

export type SavedHaikuActionModalsProps = {
  haiku: HaikuDto;
  share: LazyDialog<typeof ShareModal>;
  labels: LazyDialog<typeof CreateAddLabelsModal>;
  onChanged?: () => void;
  deleteDialog: Pick<DeleteConfirmModalProps, "open" | "onOpenChange" | "onConfirm" | "confirming">;
};
