export type ShareLinkActionsProps = {
  /** Haiku subject, used in accessible labels. */
  subject: string;
  /** Public share page URL, opened by "Go to link". */
  shareUrl: string;
  showLabels: boolean;
  togglingLabels: boolean;
  onPreview: () => void;
  onToggleLabels: () => void;
  onDelete: () => void;
  className?: string;
};
