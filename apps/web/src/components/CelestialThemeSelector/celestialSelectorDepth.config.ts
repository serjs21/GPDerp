/** Orbit depth illusion — nearer body scales up on its hemisphere. */
export const CELESTIAL_SELECTOR_DEPTH = {
  /** Sun y delta from horizon (50%) mapped to 0..1 via smoothstep divisor. */
  hemisphereBandPercent: 20,
  moonFarScale: 0.85,
  moonNearScale: 1.3,
  sunNearScale: 1.15,
  sunFarScale: 0.7,
  zIndexNear: 4,
  zIndexFar: 2,
} as const;
