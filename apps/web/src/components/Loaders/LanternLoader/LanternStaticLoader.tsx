// Server-safe (no "use client", no inline styles): renders in the initial HTML before any app data loads.
import { useTranslations } from "next-intl";
import { LoadingText } from "@/components/Loaders/LoadingText";
import { LANTERN_LOADER_ASSET } from "./consts/lanternLoaderConsts";
import type { LanternStaticLoaderProps } from "./LanternStaticLoader.types";
import styles from "./LanternLoader.module.css";
import staticStyles from "./LanternStaticLoader.module.css";

/** Sets LoadingText's dot cycle to the static lantern's step clock, for a caption rendered outside the lantern. */
export const LANTERN_STATIC_TEXT_TIMING_CLASS = staticStyles.textTiming;

/** LanternLoader with LANTERN_LOADER_DEFAULTS fixed in CSS: same markup and classes, no props to tune. */
export function LanternStaticLoader({ className }: LanternStaticLoaderProps) {
  const t = useTranslations("Loaders.lanternLoader");

  return (
    <div
      className={[styles.root, staticStyles.defaults, staticStyles.textTiming, className].filter(Boolean).join(" ")}
      role="status"
      aria-label={t("ariaLabel")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG in the pre-hydration loader */}
      <img
        className={`${styles.lantern} ${staticStyles.frames}`}
        src={LANTERN_LOADER_ASSET.src}
        alt=""
        width={LANTERN_LOADER_ASSET.width}
        height={LANTERN_LOADER_ASSET.height}
        draggable={false}
        fetchPriority="high"
      />
      <LoadingText className={styles.text} />
    </div>
  );
}
