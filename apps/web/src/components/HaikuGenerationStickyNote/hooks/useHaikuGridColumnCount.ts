"use client";

import { useEffect, useState } from "react";
import {
  HAIKU_GRID_COLUMN_GAP_REM,
  HAIKU_GRID_EDGE_PADDING_PX,
} from "../constants";

function rootFontSizePx(): number {
  if (typeof window === "undefined") return 16;
  const parsed = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

export function computeHaikuGridColumnCount(
  viewportWidth: number,
  cardWidthRem: number,
  columnGapRem: number = HAIKU_GRID_COLUMN_GAP_REM,
): number {
  const rootPx = rootFontSizePx();
  const cardPx = cardWidthRem * rootPx;
  const gapPx = columnGapRem * rootPx;
  const slot = cardPx + gapPx;
  if (slot <= 0) return 1;
  return Math.max(1, Math.floor((viewportWidth - HAIKU_GRID_EDGE_PADDING_PX) / slot));
}

export function useHaikuGridColumnCount(cardWidthRem: number) {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const update = () => {
      setColumns(computeHaikuGridColumnCount(window.innerWidth, cardWidthRem));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardWidthRem]);

  return {
    columns,
    cardWidthRem,
    columnGapRem: HAIKU_GRID_COLUMN_GAP_REM,
  };
}
