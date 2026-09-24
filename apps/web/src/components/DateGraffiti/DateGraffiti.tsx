import styles from "./DateGraffiti.module.css";
import { formatDateGraffiti, toDateTimeAttribute } from "./utils/formatDateGraffiti";

export type DateGraffitiProps = {
  date: string | Date;
  className?: string;
  /** Accessible label; defaults to "Created". */
  label?: string;
};

/**
 * Graffiti-styled creation date (Flacucho).
 */
export function DateGraffiti({ date, className, label = "Created" }: DateGraffitiProps) {
  const text = formatDateGraffiti(date);
  if (!text) return null;

  const dateTime = toDateTimeAttribute(date);

  return (
    <time
      className={[styles.root, className].filter(Boolean).join(" ")}
      dateTime={dateTime}
      aria-label={`${label} ${text}`}
    >
      {text}
    </time>
  );
}
