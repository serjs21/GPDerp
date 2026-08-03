import type { CSSProperties } from "react";
import styles from "./DaylightStars.module.css";

const STAR_POSITIONS = [
  { left: "18%", top: "11%" },
  { left: "72%", top: "8%" },
  { left: "84%", top: "16%" },
  { left: "61%", top: "22%" },
  { left: "28%", top: "18%" },
  { left: "45%", top: "9%" },
  { left: "91%", top: "28%" },
  { left: "8%", top: "26%" },
] as const;

type DaylightStarsProps = {
  style?: CSSProperties;
};

export const DaylightStars = ({ style }: DaylightStarsProps) => (
  <div className={styles.field} style={style} aria-hidden>
    {STAR_POSITIONS.map((position, index) => (
      <span
        key={`star-${index}`}
        className={styles.star}
        style={{ left: position.left, top: position.top }}
      />
    ))}
  </div>
);
