"use client";

import type { CSSProperties } from "react";
import styles from "./SharedHaikuTyping.module.css";

type SharedHaikuTypingProps = {
  title: string;
  body: string;
};

type Chunk = { key: string; value: string; isNewline: boolean };

const splitIntoChunks = (text: string): Chunk[] => {
  const out: Chunk[] = [];
  const parts = text.split("\n");
  let partKey = 0;

  for (const part of parts) {
    let i = 0;
    let toggle = 0;
    while (i < part.length) {
      const size = toggle % 2 === 0 ? 2 : 3;
      const chunk = part.slice(i, i + size);
      out.push({
        key: `c-${partKey}-${i}`,
        value: chunk,
        isNewline: false,
      });
      i += size;
      toggle += 1;
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

const renderChunked = (text: string) => {
  const chunks = splitIntoChunks(text);
  let chunkIndex = 0;
  return chunks.map((chunk) => {
    if (chunk.isNewline) {
      return <br key={chunk.key} />;
    }
    const style = { "--chunk-index": chunkIndex } as CSSProperties;
    chunkIndex += 1;
    return (
      <span key={chunk.key} className={styles.chunk} style={style} data-chunk-number={chunkIndex}>
        {chunk.value}
      </span>
    );
  });
};

export const SharedHaikuTyping = ({ title, body }: SharedHaikuTypingProps) => {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{renderChunked(title)}</h1>
      <p className={styles.body}>{renderChunked(body)}</p>
    </div>
  );
};
