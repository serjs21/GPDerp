import type { HaikuDto } from "@/api/haikus";

export type ShareLinkPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  /** Shared haiku; undefined while the row enrichment is still loading. */
  haiku?: HaikuDto;
  loading?: boolean;
};
