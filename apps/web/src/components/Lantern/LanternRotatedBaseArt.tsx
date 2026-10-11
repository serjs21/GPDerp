import type { LanternRotatedBaseArtProps } from "./LanternRotatedBaseArt.types";
import styles from "./LanternRotated.module.css";
import { hasRotatedFlame } from "./utils/rotatedShellUtils";

/** Decorative rotated lantern PNG (optionally mirrored) with its flame overlay. */
export function LanternRotatedBaseArt({ transform, mirrored }: LanternRotatedBaseArtProps) {
  const shellClass = [styles.shell, mirrored ? styles.shellMirrored : null].filter(Boolean).join(" ");
  return (
    <div className={shellClass} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative lantern art from /public */}
      <img
        className={styles.image}
        src={transform.assetSrc}
        alt=""
        width={transform.imageWidth}
        height={transform.imageHeight}
        draggable={false}
        decoding="async"
      />
      {hasRotatedFlame(transform) ? <span className={styles.flame} /> : null}
    </div>
  );
}
