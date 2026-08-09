"use client";

import { forwardRef, type ReactNode } from "react";
import {
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  routeStopById,
} from "../path";
import styles from "../Lantern.stories.module.css";

const ROUTE_GUIDE_SRC = "/route-split-segments-exact.svg";

export type LanternPathStageProps = {
  children: ReactNode;
  hud?: ReactNode;
  controls?: ReactNode;
  className?: string;
};

export const LanternPathStage = forwardRef<HTMLDivElement, LanternPathStageProps>(
  function LanternPathStage({ children, hud, controls, className }, ref) {
    const exitStop = routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID);
    const initialStop = routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);

    const viewportClass = [styles.flightPathViewport, className].filter(Boolean).join(" ");

    return (
      <div ref={ref} className={viewportClass}>
        {hud}
        <div className={styles.flightPathStage} aria-label="Lantern flight path">
          <div className={styles.flightPathGuideBox}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ROUTE_GUIDE_SRC} alt="" draggable={false} decoding="async" />
            {exitStop ? (
              <span
                className={`${styles.flightPathStopLabel} ${styles.flightPathStopLabelExit}`}
                style={{ left: `${exitStop.x * 100}%`, top: `${exitStop.y * 100}%` }}
                aria-hidden
              >
                0
              </span>
            ) : null}
            {initialStop ? (
              <span
                className={`${styles.flightPathStopLabel} ${styles.flightPathStopLabelInitial}`}
                style={{ left: `${initialStop.x * 100}%`, top: `${initialStop.y * 100}%` }}
                aria-hidden
              >
                1
              </span>
            ) : null}
            {children}
          </div>
        </div>
        {controls}
      </div>
    );
  },
);
