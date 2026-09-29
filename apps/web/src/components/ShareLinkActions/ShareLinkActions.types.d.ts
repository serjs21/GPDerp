export type ShareLinkActionsProps = {
  /** Haiku subject, used in accessible labels. */
  subject: string;
  /** Update is disabled while the share link is not active. */
  active: boolean;
  /** Limits differ from the saved link and are valid. */
  canUpdate: boolean;
  updating: boolean;
  showLabels: boolean;
  togglingLabels: boolean;
  onPreview: () => void;
  onUpdate: () => void;
  onToggleLabels: () => void;
  onDelete: () => void;
  className?: string;
};
