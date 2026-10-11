"use client";

import { useId } from "react";
import {
  colorBalanceToMatrix,
  useBackgroundSceneThemeBalance,
} from "@/components/BackgroundScene";
import {
  POST_SIGN_INPUT_ASSET_SRC,
  POST_SIGN_INPUT_IMAGE_HEIGHT,
  POST_SIGN_INPUT_IMAGE_WIDTH,
} from "./constants";
import styles from "./PostSignInput.module.css";

/** Decorative post-sign art tinted to the background scene's theme balance. */
export function PostSignArt() {
  const filterId = useId().replace(/:/g, "");
  const { global } = useBackgroundSceneThemeBalance();

  return (
    <>
      <svg className={styles.filterDefs} aria-hidden>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={colorBalanceToMatrix(global)} />
          </filter>
        </defs>
      </svg>

      <div className={styles.shell} aria-hidden>
        {/* Native img required for SVG feColorMatrix filter url() — same as BackgroundScene forefront art. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative post-sign art from /public */}
        <img
          className={styles.image}
          src={POST_SIGN_INPUT_ASSET_SRC}
          alt=""
          width={POST_SIGN_INPUT_IMAGE_WIDTH}
          height={POST_SIGN_INPUT_IMAGE_HEIGHT}
          draggable={false}
          decoding="async"
          style={{ filter: `url(#${filterId})` }}
        />
      </div>
    </>
  );
}
