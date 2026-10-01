import type { HaikuDto } from "@/api/haikus";

export type ShareLinkPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  /** Public share page URL, opened by "Go to link". */
  shareUrl: string;
  /** Shared haiku; undefined while the row enrichment is still loading. */
  haiku?: HaikuDto;
  loading?: boolean;
  /** Share link setting; when false the preview dims labels instead of hiding them. */
  showLabels: boolean;
  togglingLabels: boolean;
  onToggleLabels: () => void;
};
