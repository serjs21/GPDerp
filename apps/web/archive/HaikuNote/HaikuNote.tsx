import type { CSSProperties } from "react";
import { parseHaikuBody } from "@/utils/parseHaikuBody";
import styles from "./HaikuNote.module.css";

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
  const lines = parsed.lines.filter(Boolean);
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
