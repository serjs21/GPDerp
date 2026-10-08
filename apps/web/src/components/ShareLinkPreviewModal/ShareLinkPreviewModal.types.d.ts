import type { HaikuDto } from "@/api/haikus";

export type ShareLinkPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  /** Public share page; "Follow the link" is disabled without it. */
  shareUrl?: string;
  /** Shared haiku; undefined while the row enrichment is still loading. */
  haiku?: HaikuDto;
  loading?: boolean;
  /** Share link setting; when false the preview dims labels instead of hiding them. */
  showLabels: boolean;
  togglingLabels: boolean;
  onToggleLabels: () => void;
  /** Refetch the haiku after label placement / label edits. */
  onHaikuChanged: () => void;
};
