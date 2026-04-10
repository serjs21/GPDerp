"use client";

import chunk from "lodash-es/chunk";
import type { CSSProperties } from "react";
import styles from "./TextTyping.module.css";

export type TextTypingProps = {
  text: string;
};

type Piece = { key: string; value: string; isNewline: boolean };

const splitIntoChunks = (text: string): Piece[] => {
  const out: Piece[] = [];
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
};

export const TextTyping = ({ text }: TextTypingProps) => {
  const pieces = splitIntoChunks(text);
  let chunkIndex = 0;

  return (
    <>
      {pieces.map((piece) => {
        if (piece.isNewline) {
          return <br key={piece.key} />;
        }
        const style = { "--chunk-index": chunkIndex } as CSSProperties;
        chunkIndex += 1;
        return (
          <span
            key={piece.key}
            className={styles.chunk}
            style={style}
            data-chunk-number={chunkIndex}
          >
            {piece.value}
          </span>
        );
      })}
    </>
  );
};
