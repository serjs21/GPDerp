/** Send button state: ready to click, highlighted panel, and the tooltip / aria copy to show. */
export function shareEmailSendView(params: {
  canSendEmail: boolean;
  sendingEmail: boolean;
  preparingPostcard: boolean;
  emailCtaHint: string;
  preparingPostcardLabel: string;
  sendEmailLabel: string;
}) {
  const { canSendEmail, sendingEmail, preparingPostcard, emailCtaHint, preparingPostcardLabel, sendEmailLabel } =
    params;
  const ready = canSendEmail && !sendingEmail;
  const active = canSendEmail || sendingEmail;
  return {
    ready,
    panelBackground: active ? ("halftone" as const) : ("solid" as const),
    panelColor: active ? ("teal" as const) : ("white" as const),
    tooltipTitle: sendTooltipTitle(preparingPostcard, ready, emailCtaHint, preparingPostcardLabel),
    tooltipOpen: preparingPostcard || undefined,
    ariaLabel: preparingPostcard ? preparingPostcardLabel : sendEmailLabel,
  };
}

function sendTooltipTitle(preparingPostcard: boolean, ready: boolean, emailCtaHint: string, preparingLabel: string) {
  if (preparingPostcard) return preparingLabel;
  return ready ? "" : emailCtaHint;
}
