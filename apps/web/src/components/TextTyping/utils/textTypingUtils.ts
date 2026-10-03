import chunk from "lodash-es/chunk";

export type TextTypingPiece = { key: string; value: string; isNewline: boolean };

/** Splits text into alternating 2/3-character reveal chunks; `\n` becomes its own piece. */
export function splitIntoTypingChunks(text: string): TextTypingPiece[] {
  const out: TextTypingPiece[] = [];
  const parts = text.split("\n");
  let partKey = 0;

  for (const part of parts) {
    const quintuples = chunk([...part], 5);
    let offset = 0;
    let toggle = 0;

    for (const group of quintuples) {
      let j = 0;
      while (j < group.length) {
        const size = toggle % 2 === 0 ? 2 : 3;
        const piece = group.slice(j, j + size);
        out.push({
          key: `c-${partKey}-${offset}`,
          value: piece.join(""),
          isNewline: false,
        });
        offset += piece.length;
        j += piece.length;
        toggle += 1;
      }
    }

    partKey += 1;
    if (partKey < parts.length) {
      out.push({
        key: `n-${partKey}`,
        value: "\n",
        isNewline: true,
      });
    }
  }

  return out;
}

/** Number of revealed (non-newline) chunks — the next segment's `startIndex`. */
export function countTypingChunks(text: string): number {
  return splitIntoTypingChunks(text).filter((piece) => !piece.isNewline).length;
}

/** `startIndex` per segment so consecutive TextTyping segments reveal as one sequence. */
export function typingStartIndices(segments: string[]): number[] {
  return segments.reduce<number[]>((starts, _segment, index) => {
    const start = index === 0 ? 0 : starts[index - 1] + countTypingChunks(segments[index - 1]);
    return [...starts, start];
  }, []);
}
