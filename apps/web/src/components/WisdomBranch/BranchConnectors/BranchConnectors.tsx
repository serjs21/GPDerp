"use client";

import { useEffect, useMemo, useState } from "react";
import {
  WISDOM_BRANCH_MOBILE_MAX_WIDTH_PX,
  WISDOM_BRANCH_OVERSHOOT_DESKTOP_REM,
  WISDOM_BRANCH_OVERSHOOT_MOBILE_REM,
} from "../constants";
import { computeConnectorLines } from "../wisdomBranchLayoutVars";
import styles from "./BranchConnectors.module.css";

function useBranchOvershootRem(): number {
  const [overshootRem, setOvershootRem] = useState(WISDOM_BRANCH_OVERSHOOT_DESKTOP_REM);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${WISDOM_BRANCH_MOBILE_MAX_WIDTH_PX}px)`);
    const sync = () => {
      setOvershootRem(
        mediaQuery.matches
          ? WISDOM_BRANCH_OVERSHOOT_MOBILE_REM
          : WISDOM_BRANCH_OVERSHOOT_DESKTOP_REM,
      );
    };

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return overshootRem;
}

function toSvgPercent(value: number): string {
  return `${value * 100}%`;
}

export function BranchConnectors() {
  const overshootRem = useBranchOvershootRem();
  const lines = useMemo(() => computeConnectorLines(overshootRem), [overshootRem]);

  return (
    <svg
      className={styles.connectors}
      aria-hidden
      preserveAspectRatio="none"
      viewBox="0 0 1 1"
    >
      <line
        className={styles.line}
        x1={toSvgPercent(lines.left.x1)}
        y1={toSvgPercent(lines.left.y1)}
        x2={toSvgPercent(lines.left.x2)}
        y2={toSvgPercent(lines.left.y2)}
      />
      <line
        className={styles.line}
        x1={toSvgPercent(lines.right.x1)}
        y1={toSvgPercent(lines.right.y1)}
        x2={toSvgPercent(lines.right.x2)}
        y2={toSvgPercent(lines.right.y2)}
      />
    </svg>
  );
}
