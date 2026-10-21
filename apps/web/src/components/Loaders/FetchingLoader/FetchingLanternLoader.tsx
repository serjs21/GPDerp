// Server-safe (no "use client", no inline styles).
import { LANTERN_ASSET_SRC, LANTERN_IMAGE_HEIGHT, LANTERN_IMAGE_WIDTH } from "@/components/Lantern/constants";
import { FetchingLanternFace } from "./FetchingLanternFace";
import type { FetchingLanternLoaderProps } from "./FetchingLanternLoader.types";
import styles from "./FetchingLanternLoader.module.css";

/** The lantern base with FetchingStaticLoader (running dog + "Fetching...") on its front panel. */
export function FetchingLanternLoader({ className }: FetchingLanternLoaderProps) {
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
      <FetchingLanternFace className={styles.face} />
    </div>
  );
}
