import type { PathOverlayFillOrigin } from "../PathOverlay";
import { CELL_PX } from "../consts/pathScrimConsts";

export function gridDimsForViewport(width: number, height: number) {
  const cols = Math.max(1, Math.ceil(width / CELL_PX));
  const rows = Math.max(1, Math.ceil(height / CELL_PX));
  return {
    cols: cols % 2 === 0 ? cols + 1 : cols,
    rows: rows % 2 === 0 ? rows + 1 : rows,
  };
}

/** Ease-out cubic matching anime `out(3)` feel for canvas cell alpha. */
export function easeOut3(t: number) {
  return 1 - (1 - t) ** 3;
}

export function cellRing(
  fillOrigin: PathOverlayFillOrigin,
  col: number,
  row: number,
  cols: number,
  rows: number,
  dark: boolean,
  darkFromTop: boolean,
): number {
  if (fillOrigin === "vertical") {
    // Dark from top (sun up) or bottom (sun down); bright from the opposite edge.
    if (dark) {
      return darkFromTop ? row : rows - 1 - row;
    }
    return darkFromTop ? rows - 1 - row : row;
  }

  if (fillOrigin === "sideCorners") {
    // Dark from both left corners; light from both right corners.
    if (dark) {
      const fromTopLeft = Math.max(col, row);
      const fromBottomLeft = Math.max(col, rows - 1 - row);
      return Math.min(fromTopLeft, fromBottomLeft);
    }
    const fromTopRight = Math.max(cols - 1 - col, row);
    const fromBottomRight = Math.max(cols - 1 - col, rows - 1 - row);
    return Math.min(fromTopRight, fromBottomRight);
  }

  if (fillOrigin === "corners") {
    // Dark from top-left; light from bottom-right.
    return dark
      ? Math.max(col, row)
      : Math.max(cols - 1 - col, rows - 1 - row);
  }

  const centerCol = (cols - 1) / 2;
  const centerRow = (rows - 1) / 2;
  return Math.max(Math.abs(col - centerCol), Math.abs(row - centerRow));
}

export function cellDelayMs(
  fillOrigin: PathOverlayFillOrigin,
  col: number,
  row: number,
  cols: number,
  rows: number,
  staggerStepMs: number,
  dark: boolean,
  darkFromTop: boolean,
): number {
  return (
    cellRing(fillOrigin, col, row, cols, rows, dark, darkFromTop) * staggerStepMs
  );
}

export function maxRingForOrigin(
  fillOrigin: PathOverlayFillOrigin,
  cols: number,
  rows: number,
): number {
  if (fillOrigin === "vertical") {
    return rows - 1;
  }
  if (fillOrigin === "sideCorners") {
    // Farthest cell is mid-height near the opposite side of each half.
    return Math.max(cols - 1, Math.ceil((rows - 1) / 2));
  }
  if (fillOrigin === "corners") {
    return Math.max(cols - 1, rows - 1);
  }
  return Math.max((cols - 1) / 2, (rows - 1) / 2);
}
