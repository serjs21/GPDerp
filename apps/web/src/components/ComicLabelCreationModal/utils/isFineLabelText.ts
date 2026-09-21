import { FINE_LABEL_PHRASE_MAP } from "../consts/fineLabelConsts";

function normalizeFineLabelText(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/^["'“‘«]+|[!”"’»!.?…]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatchesText(phrase: string, text: string): boolean {
  const graphemeCount = [...phrase].length;
  // Single-character phrases (e.g. Thai ดี) only match the whole label.
  if (graphemeCount === 1) return false;

  const isLatinPhrase = /^[\p{L}\p{N}\s'’-]+$/u.test(phrase);
  if (isLatinPhrase) {
    const pattern = escapeRegExp(phrase).replace(/\s+/g, "\\s+");
    return new RegExp(`(?<!\\p{L})${pattern}(?!\\p{L})`, "iu").test(text);
  }

  return text.includes(phrase);
}

/** True when `value` is (or contains) “fine” in a supported language. */
export function isFineLabelText(value: string): boolean {
  const text = normalizeFineLabelText(value);
  if (!text) return false;
  if (FINE_LABEL_PHRASE_MAP.has(text)) return true;

  return Array.from(FINE_LABEL_PHRASE_MAP.keys()).some((phrase) =>
    phraseMatchesText(phrase, text),
  );
}
