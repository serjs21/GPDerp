import { GMAIL_FROM_FALLBACK } from "../consts/gmailPreviewConsts";

export type Mailbox = { name: string; address: string };

/** `"Name <a@b.c>"`, `Name <a@b.c>` or `a@b.c` → display name + address (Gmail shows the local part when unnamed). */
export function parseMailbox(raw: string): Mailbox {
  const trimmed = raw.trim();
  if (!trimmed) return { ...GMAIL_FROM_FALLBACK };
  const match = /^"?([^"<]*?)"?\s*<([^>]+)>$/.exec(trimmed);
  if (match) {
    const address = match[2].trim();
    return { name: match[1].trim() || address.split("@")[0], address };
  }
  return { name: trimmed.split("@")[0], address: trimmed };
}