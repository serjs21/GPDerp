// Server-safe (no "use client", no inline styles).
import { FetchingStaticLoader } from "./FetchingStaticLoader";
import type { FetchingLanternFaceProps } from "./FetchingLanternFace.types";
import styles from "./FetchingLanternFace.module.css";

/** FetchingStaticLoader sized for a lantern's front panel (upright, or the skewed face of a rotated base). */
export function FetchingLanternFace({ className }: FetchingLanternFaceProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <FetchingStaticLoader />
    </div>
  );
}
