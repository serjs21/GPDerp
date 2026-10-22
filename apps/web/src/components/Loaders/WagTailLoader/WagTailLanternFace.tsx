// Server-safe (no "use client", no inline styles).
import { WagTailStaticLoader } from "./WagTailStaticLoader";
import type { WagTailLanternFaceProps } from "./WagTailLanternFace.types";
import styles from "./WagTailLanternFace.module.css";

/** Wag-tail dog over a caption, sized for a lantern's front panel (e.g. inside LanternBaseLoaderShell). */
export function WagTailLanternFace({ className, caption }: WagTailLanternFaceProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} role="status">
      <WagTailStaticLoader className={styles.dog} />
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}
