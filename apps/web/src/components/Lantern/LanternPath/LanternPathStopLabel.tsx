import { routeStopById } from "../path";
import type { LanternPathStopLabelProps } from "./LanternPathStopLabel.types";
import styles from "./LanternPath.module.css";

/** Debug marker pinned at a route stop's position, labelled with its id. */
export function LanternPathStopLabel({ stopId, className }: LanternPathStopLabelProps) {
  const stop = routeStopById(stopId);
  if (!stop) return null;

  return (
    <span
      className={`${styles.flightPathStopLabel} ${className}`}
      style={{ left: `${stop.x * 100}%`, top: `${stop.y * 100}%` }}
      aria-hidden
    >
      {stopId}
    </span>
  );
}
