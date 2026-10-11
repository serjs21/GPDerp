import { parseHaikuBody } from "@/utils/parseHaikuBody";
import { typingStartIndices } from "@/components/TextTyping/utils/textTypingUtils";

/** Body lines + author line, with typing start indices for title → lines → author as one sequence. */
export function lanternContentTyping(title: string | undefined, body: string) {
  const { lines, author } = parseHaikuBody(body);
  const authorText = author ? `—${author}` : "";
  const starts = typingStartIndices([title ?? "", ...lines, authorText]);
  return {
    lines,
    authorText,
    lineStarts: starts.slice(1, 1 + lines.length),
    authorStart: starts[starts.length - 1],
  };
}
