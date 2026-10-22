export const HAIKU_LINE_LIMIT = 3;

/** Longest expected haiku line length for lantern typography sizing. */
export const HAIKU_MAX_LINE_CHARS = 36;

export type ParsedHaikuBody = {
  lines: [string, string, string];
  author?: string;
};

/** Credit prefix: hyphen, Unicode dashes U+2010–U+2015 (en dash, em dash, …) or a tilde. */
const AUTHOR_PREFIX = /^[-\u2010-\u2015~]+\s*/;

function isAuthorLine(line: string): boolean {
  return AUTHOR_PREFIX.test(line);
}

function stripAuthorPrefix(line: string): string {
  return line.replace(AUTHOR_PREFIX, "").trim();
}

/** Blank-line separated paragraphs, each a list of trimmed non-empty lines. */
function splitBlocks(body: string): string[][] {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((block) => block.length > 0);
}

type AuthorSplit = { content: string[]; author?: string };

/**
 * Finds the credit line wherever the model put it: a dash-prefixed last or first line, or (no dash) a
 * single line set apart by a blank line from a poem block of 2+ lines. The 2+ rule keeps a half-streamed
 * body like "Name\n\nFirst li" from being split the wrong way.
 */
function splitAuthor(blocks: string[][]): AuthorSplit {
  const parts = blocks.flat();
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (last && isAuthorLine(last)) return { content: parts.slice(0, -1), author: stripAuthorPrefix(last) };
  if (first && isAuthorLine(first)) return { content: parts.slice(1), author: stripAuthorPrefix(first) };

  if (blocks.length > 1) {
    const lastBlock = blocks[blocks.length - 1];
    const firstBlock = blocks[0];
    const poemBefore = blocks.slice(0, -1).flat();
    const poemAfter = blocks.slice(1).flat();
    if (lastBlock.length === 1 && poemBefore.length >= 2) return { content: poemBefore, author: lastBlock[0] };
    if (firstBlock.length === 1 && poemAfter.length >= 2) return { content: poemAfter, author: firstBlock[0] };
  }

  return { content: parts };
}

/**
 * Splits a haiku body into exactly three content lines and an optional author credit.
 */
export function parseHaikuBody(body: string): ParsedHaikuBody {
  const { content, author } = splitAuthor(splitBlocks(body));

  const lines = content.slice(0, HAIKU_LINE_LIMIT);
  while (lines.length < HAIKU_LINE_LIMIT) {
    lines.push("");
  }

  return {
    lines: [lines[0] ?? "", lines[1] ?? "", lines[2] ?? ""],
    author: author || undefined,
  };
}
