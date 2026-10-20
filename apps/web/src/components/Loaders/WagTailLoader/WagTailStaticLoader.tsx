// Server-safe (no "use client", no hooks): renders in the initial HTML before any app data loads.
import {
  WAG_TAIL_ASSET_SIZES,
  WAG_TAIL_ASSETS,
  WAG_TAIL_COPY_COUNT,
  WAG_TAIL_REST_COPY_INDEX,
} from "./consts/wagTailLoaderConsts";
import type { WagTailStaticLoaderProps } from "./WagTailStaticLoader.types";
import styles from "./WagTailLoader.module.css";
import staticStyles from "./WagTailStaticLoader.module.css";

const COPY_CLASSES = [staticStyles.copy0, staticStyles.copy1, staticStyles.copy2, staticStyles.copy3].slice(
  0,
  WAG_TAIL_COPY_COUNT,
);

/**
 * Wag-tail loader with WAG_TAIL_LOADER_DEFAULTS fixed in CSS: same markup and keyframes as WagTailLoader,
 * no props to tune and no inline styles. Decorative — the surrounding loading screen announces "Loading".
 */
export function WagTailStaticLoader({ className, background }: WagTailStaticLoaderProps) {
  return (
    <div className={[styles.root, staticStyles.defaults, className].filter(Boolean).join(" ")} aria-hidden>
      {background}
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG in the pre-hydration loader */}
      <img
        className={styles.base}
        src={WAG_TAIL_ASSETS.base}
        alt=""
        width={WAG_TAIL_ASSET_SIZES.base.width}
        height={WAG_TAIL_ASSET_SIZES.base.height}
        draggable={false}
      />
      <span className={styles.anchor}>
        {COPY_CLASSES.map((copyClass, index) => (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG in the pre-hydration loader
          <img
            key={copyClass}
            className={`${styles.tail} ${copyClass}`}
            data-rest={index === WAG_TAIL_REST_COPY_INDEX || undefined}
            src={WAG_TAIL_ASSETS.tail}
            alt=""
            width={WAG_TAIL_ASSET_SIZES.tail.width}
            height={WAG_TAIL_ASSET_SIZES.tail.height}
            draggable={false}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG in the pre-hydration loader */}
        <img
          className={`${styles.lines} ${staticStyles.linesDefaults}`}
          src={WAG_TAIL_ASSETS.motionLines}
          alt=""
          width={WAG_TAIL_ASSET_SIZES.motionLines.width}
          height={WAG_TAIL_ASSET_SIZES.motionLines.height}
          draggable={false}
        />
      </span>
    </div>
  );
}
