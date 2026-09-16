import {
  STEPPED_IRREGULAR_PROGRESSES,
  STEPPED_TRANSITION,
} from "./steppedTransition.config";

/** Evenly spaced progresses in [0, 1], inclusive, length = count. */
export function evenSteppedProgresses(count: number): number[] {
  const n = Math.max(2, Math.round(count));
  if (n === 2) return [0, 1];
  return Array.from({ length: n }, (_, i) => i / (n - 1));
}

/**
 * Progress samples for pose-to-pose motion.
 * When irregular and count matches the baked list, use that; otherwise rescale
 * the irregular template or fall back to even spacing.
 */
export function sampleSteppedProgresses(
  count: number = STEPPED_TRANSITION.poseCount,
  irregular: boolean = STEPPED_TRANSITION.irregularSpacing,
): number[] {
  const n = Math.max(2, Math.round(count));
  if (!irregular) return evenSteppedProgresses(n);

  const template = STEPPED_IRREGULAR_PROGRESSES;
  if (n === template.length) return [...template];

  // Resample irregular template by index into even parameter space.
  const even = evenSteppedProgresses(n);
  return even.map((t) => {
    const idx = t * (template.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(template.length - 1, lo + 1);
    const local = idx - lo;
    return template[lo]! + (template[hi]! - template[lo]!) * local;
  });
}
