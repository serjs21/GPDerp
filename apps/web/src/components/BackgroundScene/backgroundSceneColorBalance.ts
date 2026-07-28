/** Photoshop-style color balance slider values (−100…100, 0 = neutral). */
export type ColorBalanceValues = {
  cyanRed: number;
  magentaGreen: number;
  yellowBlue: number;
};

export const DEFAULT_COLOR_BALANCE: ColorBalanceValues = {
  cyanRed: 0,
  magentaGreen: 0,
  yellowBlue: 0,
};

const clampSlider = (value: number) => Math.min(100, Math.max(-100, value));

/** Maps slider units to SVG feColorMatrix channel offsets (0–1 range). */
const OFFSET_SCALE = 0.005;

export function normalizeColorBalance(values: ColorBalanceValues): ColorBalanceValues {
  return {
    cyanRed: clampSlider(values.cyanRed),
    magentaGreen: clampSlider(values.magentaGreen),
    yellowBlue: clampSlider(values.yellowBlue),
  };
}

/** 4×5 feColorMatrix `values` string for midtone RGB offsets. */
export function colorBalanceToMatrix(values: ColorBalanceValues): string {
  const balance = normalizeColorBalance(values);
  const redOffset = balance.cyanRed * OFFSET_SCALE;
  const greenOffset = balance.magentaGreen * OFFSET_SCALE;
  const blueOffset = balance.yellowBlue * OFFSET_SCALE;

  return [
    1, 0, 0, 0, redOffset,
    0, 1, 0, 0, greenOffset,
    0, 0, 1, 0, blueOffset,
    0, 0, 0, 1, 0,
  ].join(" ");
}
