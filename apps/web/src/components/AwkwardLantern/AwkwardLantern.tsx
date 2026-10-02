"use client";

import { LanternFrame } from "@/components/Lantern";
import type { AwkwardLanternProps } from "./AwkwardLantern.types";
import {
  AWKWARD_LANTERN_IMAGE_HEIGHT,
  AWKWARD_LANTERN_IMAGE_SRC,
  AWKWARD_LANTERN_IMAGE_WIDTH,
  AWKWARD_LANTERN_TITLE,
} from "./consts/awkwardLanternConsts";
import styles from "./AwkwardLantern.module.css";

/**
 * Regular lantern base with no actions: "This is awkward" title and the awkward illustration below it.
 */
export function AwkwardLantern({ className, widthRem }: AwkwardLanternProps) {
  return (
    <LanternFrame
      className={className}
      widthRem={widthRem}
      ariaLabel={AWKWARD_LANTERN_TITLE}
      showLabelBelt={false}
    >
      <div className={styles.stack}>
        <p className={styles.title}>{AWKWARD_LANTERN_TITLE}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- static illustration from /public */}
        <img
          className={styles.image}
          src={AWKWARD_LANTERN_IMAGE_SRC}
          alt=""
          width={AWKWARD_LANTERN_IMAGE_WIDTH}
          height={AWKWARD_LANTERN_IMAGE_HEIGHT}
          draggable={false}
          decoding="async"
        />
      </div>
    </LanternFrame>
  );
}
