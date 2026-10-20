"use client";

import { useTranslations } from "next-intl";
import {
  WAG_TAIL_ASSET_SIZES,
  WAG_TAIL_ASSETS,
  WAG_TAIL_COPY_COUNT,
  WAG_TAIL_REST_COPY_INDEX,
} from "./consts/wagTailLoaderConsts";
import type { WagTailLoaderProps } from "./WagTailLoader.types";
import { buildWagTailStyle, resolveWagTailProps, tailCopyStyle } from "./utils/wagTailLoaderUtils";
import styles from "./WagTailLoader.module.css";

const TAIL_COPY_INDEXES = Array.from({ length: WAG_TAIL_COPY_COUNT }, (_, index) => index);

/**
 * Static dog base with four tail copies fanned around one attach point. A shared 4-step opacity
 * cycle (offset per copy) makes the brightest tail jump between angles; motion lines step along.
 * CSS-only, no timers.
 */
export function WagTailLoader(props: WagTailLoaderProps) {
  const t = useTranslations("Loaders.wagTailLoader");
  const resolved = resolveWagTailProps(props);

  return (
    <div
      className={[styles.root, props.className].filter(Boolean).join(" ")}
      style={buildWagTailStyle(resolved)}
      role="status"
      aria-label={t("ariaLabel")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img
        className={styles.base}
        src={WAG_TAIL_ASSETS.base}
        alt=""
        width={WAG_TAIL_ASSET_SIZES.base.width}
        height={WAG_TAIL_ASSET_SIZES.base.height}
        draggable={false}
      />
      <span className={styles.anchor} aria-hidden>
        {TAIL_COPY_INDEXES.map((index) => (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG
          <img
            key={index}
            className={styles.tail}
            style={tailCopyStyle(index)}
            data-rest={index === WAG_TAIL_REST_COPY_INDEX || undefined}
            src={WAG_TAIL_ASSETS.tail}
            alt=""
            width={WAG_TAIL_ASSET_SIZES.tail.width}
            height={WAG_TAIL_ASSET_SIZES.tail.height}
            draggable={false}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.lines}
          src={WAG_TAIL_ASSETS.motionLines}
          alt=""
          width={WAG_TAIL_ASSET_SIZES.motionLines.width}
          height={WAG_TAIL_ASSET_SIZES.motionLines.height}
          draggable={false}
        />
        {resolved.showAttachPoint ? <span className={styles.attachDot} /> : null}
      </span>
    </div>
  );
}
