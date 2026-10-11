import { LANTERN_FLIGHT_PATH_EXIT_STOP_ID, LANTERN_FLIGHT_PATH_INITIAL_STOP_ID } from "../path";
import { LanternPathStopLabel } from "./LanternPathStopLabel";
import styles from "./LanternPath.module.css";

const ROUTE_GUIDE_SRC = "/route-split-segments-exact.svg";

/** Storybook/debug overlay: SVG route guide plus exit / initial stop markers. */
export function LanternPathGuides() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ROUTE_GUIDE_SRC} alt="" draggable={false} decoding="async" />
      <LanternPathStopLabel stopId={LANTERN_FLIGHT_PATH_EXIT_STOP_ID} className={styles.flightPathStopLabelExit} />
      <LanternPathStopLabel
        stopId={LANTERN_FLIGHT_PATH_INITIAL_STOP_ID}
        className={styles.flightPathStopLabelInitial}
      />
    </>
  );
}
