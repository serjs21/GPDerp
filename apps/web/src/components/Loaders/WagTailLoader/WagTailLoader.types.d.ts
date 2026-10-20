export type WagTailOpacities = readonly [number, number, number, number];

export type WagTailLoaderProps = {
  className?: string;
  /** Rendered width of the dog base; everything else scales with it. */
  widthRem?: number;
  /** Tail attach point on the base, in % of its width / height (default right center: 100 / 50). */
  attachXPercent?: number;
  attachYPercent?: number;
  /** Tail width in % of the base width. */
  tailWidthPercent?: number;
  /** Rotation of the first copy; copy i is rotated by baseRotationDeg + i * stepDeg around its bottom-left corner. */
  baseRotationDeg?: number;
  stepDeg?: number;
  /** Opacity pattern moved one copy along every `stepMs` (default 0.6, 1, 0.8, 0.5). */
  opacities?: WagTailOpacities;
  stepMs?: number;
  /** Motion lines' bottom-left corner relative to the attach point, in % of the base width (+Y is up). */
  linesOffsetXPercent?: number;
  linesOffsetYPercent?: number;
  linesWidthPercent?: number;
  /** Per-step drift / tilt of the motion lines. */
  linesShiftPx?: number;
  linesRotateDeg?: number;
  /** Debug dot on the attach point, for manual tuning. */
  showAttachPoint?: boolean;
};
