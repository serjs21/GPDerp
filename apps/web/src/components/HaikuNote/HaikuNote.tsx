import type { CSSProperties } from "react";
import styles from "./HaikuNote.module.css";

const HAIKU_LINE_LIMIT = 3;

const parseHaikuBody = (body: string): { lines: string[]; author?: string } => {
  const parts = body
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const last = parts[parts.length - 1];
  if (last?.startsWith("-")) {
    return { lines: parts.slice(0, -1), author: last.slice(1).trim() };
  }

  return { lines: parts };
};

export type HaikuNoteProps = {
  body: string;
  author?: string;
  meta?: string;
  rotate?: number;
  className?: string;
};

export const HaikuNote = ({
  body,
  author: authorProp,
  meta,
  rotate = 0,
  className,
}: HaikuNoteProps) => {
  const parsed = parseHaikuBody(body);
  const lines = parsed.lines.slice(0, HAIKU_LINE_LIMIT);
  const author = authorProp ?? parsed.author;
  const stripLabel = meta ?? author;

  return (
    <article
      className={`${styles.note}${className ? ` ${className}` : ""}`}
      style={{ "--note-rotate": `${rotate}deg` } as CSSProperties}
    >
      <div className={styles.hanger} aria-hidden>
        <span className={styles.string} />
        <span className={styles.hole} />
      </div>

      <div className={styles.card}>
        <div className={styles.columns} aria-label="Haiku">
          {lines.map((line) => (
            <p key={line} className={styles.column}>
              {line}
            </p>
          ))}
        </div>

        {stripLabel ? (
          <aside className={styles.metaStrip} aria-label={meta ? "Date" : "Author"}>
            {stripLabel}
          </aside>
        ) : null}

        <span className={styles.seal} aria-hidden />
      </div>
    </article>
  );
};
