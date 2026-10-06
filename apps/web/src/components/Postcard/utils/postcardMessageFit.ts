import {
  POSTCARD_MESSAGE_MAX_CHARS,
  POSTCARD_MESSAGE_MAX_LINES,
  POSTCARD_RECIPIENT_LINE_COUNT,
} from "../consts/postcardMessageConsts";

/** Enforce the character cap and the hard line-break cap. */
export function clampPostcardMessage(text: string): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const limited = lines.slice(0, POSTCARD_MESSAGE_MAX_LINES).join("\n");
  return Array.from(limited).slice(0, POSTCARD_MESSAGE_MAX_CHARS).join("");
}

/** Recipient address lines; overflow collapses into "+N more" on the last line. */
export function postcardRecipientLines(
  recipients: string[],
  lineCount: number = POSTCARD_RECIPIENT_LINE_COUNT,
): string[] {
  const cleaned = recipients.map((value) => value.trim()).filter(Boolean);
  if (cleaned.length <= lineCount) return cleaned;
  const shown = cleaned.slice(0, lineCount - 1);
  return [...shown, `+${cleaned.length - shown.length} more`];
}

/** Display name matching the API's resolveSenderName fallback order. */
export function resolvePostcardSenderName(user: {
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const userName = user.userName?.trim();
  if (userName) return userName;
  const fullName = `${user.firstName?.trim() ?? ""} ${user.lastName?.trim() ?? ""}`.trim();
  if (fullName) return fullName;
  return user.email?.split("@")[0]?.trim() || "Someone";
}
