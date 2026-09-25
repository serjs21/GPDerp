"use client";

import { useId } from "react";
import styles from "./DateGraffiti.module.css";
import { DateGraffitiSprayFilter } from "./DateGraffitiSprayFilter";
import {
  buildDateGraffitiStyle,
  type DateGraffitiPosition,
} from "./utils/dateGraffitiStyleUtils";
import { formatDateGraffiti, toDateTimeAttribute } from "./utils/formatDateGraffiti";
import { sprayPaintSeedFromDate } from "./utils/sprayPaintSeed";

export type DateGraffitiProps = {
  date: string | Date;
  className?: string;
  /** Accessible label; defaults to "Created". */
  label?: string;
  /** Optional stable SVG turbulence seed (derived from `date` when omitted). */
  seed?: number;
  /** Paint color (CSS color). */
  color?: string;
  /** Font size (CSS length, e.g. `"1.75rem"`). */
  size?: string;
  /**
   * Absolute placement inside a positioned ancestor (background stamp).
   * When set, the root uses `position: absolute`.
   */
  position?: DateGraffitiPosition;
};

/**
 * Graffiti-styled creation date (Flacucho + static spray-paint SVG filter).
 */
export function DateGraffiti({
  date,
  className,
  label = "Created",
  seed: seedProp,
  color,
  size,
  position,
}: DateGraffitiProps) {
  const text = formatDateGraffiti(date);
  const reactId = useId().replace(/:/g, "");
  const filterId = `date-graffiti-spray-${reactId}`;
  const seed = sprayPaintSeedFromDate(date, seedProp);

  if (!text) return null;

  const dateTime = toDateTimeAttribute(date);
  const absolute = position != null;

  return (
    <time
      className={[
        styles.root,
        absolute ? styles.rootAbsolute : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={buildDateGraffitiStyle({ color, size, position })}
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
