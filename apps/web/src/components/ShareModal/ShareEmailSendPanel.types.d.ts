export type ShareEmailSendPanelProps = {
  canSendEmail: boolean;
  sendingEmail: boolean;
  /** Postcard images are being generated (part of the sending phase). */
  preparingPostcard?: boolean;
  emailCtaHint: string;
  onSendEmail: () => void;
};

export type ShareEmailSendIconProps = {
  /** Sending with motion allowed: the envelope wobbles in flight. */
  flying: boolean;
};
