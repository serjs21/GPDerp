import type { getRotationBaseTransform } from "../consts/rotationBaseConsts";
import type { LanternRotatedFaceHalo } from "../LanternRotatedShell";

type RotationBaseTransform = ReturnType<typeof getRotationBaseTransform>;

export function hasRotatedFlame(transform: RotationBaseTransform): boolean {
  return transform.flameBottom != null || transform.flameHeight != null;
}

/** Mount the face LabelHalo only when it can be interacted with or has labels to show. */
export function shouldShowFaceHalo(
  faceHalo: LanternRotatedFaceHalo | null | undefined,
): faceHalo is LanternRotatedFaceHalo {
  return faceHalo != null && (Boolean(faceHalo.interactive) || faceHalo.labels.length > 0);
}
