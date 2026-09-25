"use client";

import { useId } from "react";
import styles from "./DateGraffiti.module.css";
import { DateGraffitiSprayFilter } from "./DateGraffitiSprayFilter";
import { formatDateGraffiti, toDateTimeAttribute } from "./utils/formatDateGraffiti";
import { sprayPaintSeedFromDate } from "./utils/sprayPaintSeed";

export type DateGraffitiProps = {
  date: string | Date;
  className?: string;
  /** Accessible label; defaults to "Created". */
  label?: string;
  /** Optional stable SVG turbulence seed (derived from `date` when omitted). */
  seed?: number;
};

/**
 * Graffiti-styled creation date (Flacucho + static spray-paint SVG filter).
 */
export function DateGraffiti({
  date,
  className,
  label = "Created",
  seed: seedProp,
}: DateGraffitiProps) {
  const text = formatDateGraffiti(date);
  const reactId = useId().replace(/:/g, "");
  const filterId = `date-graffiti-spray-${reactId}`;
  const seed = sprayPaintSeedFromDate(date, seedProp);

  if (!text) return null;

  const dateTime = toDateTimeAttribute(date);

  return (
    <time
      className={[styles.root, className].filter(Boolean).join(" ")}
      dateTime={dateTime}
      aria-label={`${label} ${text}`}
    >
      <svg className={styles.filterDefs} aria-hidden focusable="false">
        <defs>
          <DateGraffitiSprayFilter filterId={filterId} seed={seed} />
        </defs>
      </svg>
      <span className={styles.paint} style={{ filter: `url(#${filterId})` }}>
        {text}
      </span>
    </time>
  );
}
