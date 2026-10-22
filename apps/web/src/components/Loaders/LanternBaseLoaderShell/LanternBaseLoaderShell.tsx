// Server-safe (no "use client", no inline styles).
import { LANTERN_ASSET_SRC, LANTERN_IMAGE_HEIGHT, LANTERN_IMAGE_WIDTH } from "@/components/Lantern/constants";
import type { LanternBaseLoaderShellProps } from "./LanternBaseLoaderShell.types";
import styles from "./LanternBaseLoaderShell.module.css";

/** The lantern base with a loader on its front panel, standing in for a lantern that is still loading. */
export function LanternBaseLoaderShell({ className, children }: LanternBaseLoaderShellProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- same lantern asset as Lantern, no Next image pipeline */}
      <img
        className={styles.lantern}
        src={LANTERN_ASSET_SRC}
        alt=""
        width={LANTERN_IMAGE_WIDTH}
        height={LANTERN_IMAGE_HEIGHT}
        draggable={false}
      />
      <div className={styles.panel}>{children}</div>
    </div>
  );
}
