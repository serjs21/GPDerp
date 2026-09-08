import styles from "./GoldenAgeTitle.module.css";

export type GoldenAgeTitleProps = {
  title?: string;
  subtitle?: string;
  tagline?: string;
  className?: string;
};

const DEFAULT_TITLE = "GPDERP";
const DEFAULT_SUBTITLE = "THE HAIKU GENERATOR";
const DEFAULT_TAGLINE = "AI, BUT IMPRACTICAL!";

/**
 * Vintage 1940s–1960s comic-cover masthead: oversized yellow title,
 * chunky red extrusion, tucked subtitle, and a small cream caption box.
 * Lettering is live HTML/CSS (Bangers) so it stays editable and responsive.
 */
export function GoldenAgeTitle({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  tagline = DEFAULT_TAGLINE,
  className,
}: GoldenAgeTitleProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      <div className={styles.masthead}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.subtitleRow}>
          <p className={styles.subtitle}>{subtitle}</p>
          <svg
            className={styles.accents}
            viewBox="0 0 52 28"
            aria-hidden
            focusable="false"
          >
            <line x1="2" y1="5" x2="50" y2="2" />
            <line x1="8" y1="14" x2="48" y2="11" />
            <line x1="14" y1="23" x2="42" y2="21" />
          </svg>
        </div>
      </div>
      <p className={styles.tagline}>{tagline}</p>
    </header>
  );
}
