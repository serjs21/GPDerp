"use client";

import chunk from "lodash-es/chunk";
import type { CSSProperties, ReactNode } from "react";
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
  const { nodes } = pieces.reduce<{ chunkIndex: number; nodes: ReactNode[] }>(
    (acc, piece) => {
      if (piece.isNewline) {
        return {
          ...acc,
          nodes: [...acc.nodes, <br key={piece.key} />],
        };
      }

      const nextChunkIndex = acc.chunkIndex + 1;
      const style = { "--chunk-index": acc.chunkIndex } as CSSProperties;
      const node = (
        <span
          key={piece.key}
          className={styles.chunk}
          style={style}
          data-chunk-number={nextChunkIndex}
        >
          {piece.value}
        </span>
      );

      return {
        chunkIndex: nextChunkIndex,
        nodes: [...acc.nodes, node],
      };
    },
    { chunkIndex: 0, nodes: [] },
  );

  return <>{nodes}</>;
};
