import type { PostcardHaikuTextProps } from "./PostcardHaikuText.types";
import { postcardTextSizes } from "./utils/postcardTextFit";
import { buildPostcardTextStyle } from "./utils/postcardStyleUtils";
import styles from "./PostcardHaikuText.module.css";

export function PostcardHaikuText({ lines, title, author, fontScale }: PostcardHaikuTextProps) {
  const sizes = postcardTextSizes(lines, title, author, fontScale);

  return (
    <div className={styles.stack} style={buildPostcardTextStyle(sizes)}>
      {title ? <p className={styles.title}>{title}</p> : null}
      <div className={styles.lines}>
        {lines.map((line, index) => (
          <p key={index} className={styles.line}>
            {line || "\u00A0"}
          </p>
        ))}
      </div>
      {author ? <p className={styles.author}>{`—${author}`}</p> : null}
    </div>
  );
}
