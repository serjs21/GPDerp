import type { getRotationBaseTransform } from "./consts/rotationBaseConsts";

export type LanternRotatedBaseArtProps = {
  transform: ReturnType<typeof getRotationBaseTransform>;
  mirrored: boolean;
};
