"use client";

import { memo } from "react";
import { LANTERN_ASSET_SRC, LANTERN_IMAGE_HEIGHT, LANTERN_IMAGE_WIDTH } from "./constants";
import styles from "./Lantern.module.css";

/** Static lantern art + flame; memoized so path tween frames skip it. */
export const LanternFrameShell = memo(function LanternFrameShell() {
  return (
    <div className={styles.shell} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative lantern art from /public */}
      <img
        className={styles.image}
        src={LANTERN_ASSET_SRC}
        alt=""
        width={LANTERN_IMAGE_WIDTH}
        height={LANTERN_IMAGE_HEIGHT}
        draggable={false}
        decoding="async"
      />
      <span className={styles.flame} />
    </div>
  );
});
