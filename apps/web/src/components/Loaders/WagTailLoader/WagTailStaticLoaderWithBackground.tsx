// Server-safe (no "use client", no hooks): renders in the initial HTML before any app data loads.
import { WAG_TAIL_ASSET_SIZES, WAG_TAIL_ASSETS } from "./consts/wagTailLoaderConsts";
import { WagTailStaticLoader } from "./WagTailStaticLoader";
import type { WagTailStaticLoaderWithBackgroundProps } from "./WagTailStaticLoaderWithBackground.types";
import styles from "./WagTailLoader.module.css";

/** WagTailStaticLoader plus the stepped background (defaults fixed in WagTailStaticLoader.module.css). */
export function WagTailStaticLoaderWithBackground({ className }: WagTailStaticLoaderWithBackgroundProps) {
  return (
    <WagTailStaticLoader
      className={className}
      background={
        // eslint-disable-next-line @next/next/no-img-element -- static public SVG in the pre-hydration loader
        <img
          className={styles.background}
          src={WAG_TAIL_ASSETS.background}
          alt=""
          width={WAG_TAIL_ASSET_SIZES.background.width}
          height={WAG_TAIL_ASSET_SIZES.background.height}
          draggable={false}
          fetchPriority="high"
        />
      }
    />
  );
}
