export const HAIKU_LINE_LIMIT = 3;

/** Longest expected haiku line length for lantern typography sizing. */
export const HAIKU_MAX_LINE_CHARS = 36;

export type ParsedHaikuBody = {
  lines: [string, string, string];
  author?: string;
};

function isAuthorLine(line: string): boolean {
  return /^[-—]\s*/.test(line);
}

function stripAuthorPrefix(line: string): string {
  return line.replace(/^[-—]\s*/, "").trim();
}

/**
 * Splits a haiku body into exactly three content lines and an optional author
 * parsed from a trailing `-` or `—` line.
 */
export function parseHaikuBody(body: string): ParsedHaikuBody {
  const parts = body
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let contentLines = parts;
  let author: string | undefined;

  const last = parts[parts.length - 1];
  if (last && isAuthorLine(last)) {
    author = stripAuthorPrefix(last);
    contentLines = parts.slice(0, -1);
  }

  const lines = contentLines.slice(0, HAIKU_LINE_LIMIT) as string[];
  while (lines.length < HAIKU_LINE_LIMIT) {
    lines.push("");
  }

  return {
    lines: [lines[0] ?? "", lines[1] ?? "", lines[2] ?? ""],
    author,
  };
}
