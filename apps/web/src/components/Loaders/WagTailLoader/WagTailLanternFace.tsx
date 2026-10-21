// Server-safe (no "use client", no inline styles).
import { LoadingText } from "@/components/Loaders/LoadingText";
import { WagTailStaticLoader } from "./WagTailStaticLoader";
import type { WagTailLanternFaceProps } from "./WagTailLanternFace.types";
import styles from "./WagTailLanternFace.module.css";

/**
 * Wag-tail dog over a "Loading" caption, sized for a lantern's front panel. Decorative: WagTailLanternLoader
 * (or the lantern it is placed in) announces status.
 */
export function WagTailLanternFace({ className }: WagTailLanternFaceProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} aria-hidden>
      <WagTailStaticLoader className={styles.dog} />
      <LoadingText className={styles.caption} />
    </div>
  );
}
