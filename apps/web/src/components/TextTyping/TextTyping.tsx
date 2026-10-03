"use client";

import type { CSSProperties, ReactNode } from "react";
import { splitIntoTypingChunks } from "./utils/textTypingUtils";
import styles from "./TextTyping.module.css";

export type TextTypingProps = {
  text: string;
  /** Chunk offset so several TextTyping segments reveal one after another. */
  startIndex?: number;
};

export const TextTyping = ({ text, startIndex = 0 }: TextTypingProps) => {
  const pieces = splitIntoTypingChunks(text);
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
    { chunkIndex: startIndex, nodes: [] },
  );

  return <>{nodes}</>;
};
