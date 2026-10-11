import { HIPOINTS_SRC } from "./consts/restartLinkButtonConsts";
import type { RestartHipointsMarkProps } from "./RestartLinkButton.types";
import styles from "./RestartLinkButton.module.css";

export function RestartHipointsMark({ markRef }: RestartHipointsMarkProps) {
  return (
    <span className={styles.hipointsWell} aria-hidden>
      <span ref={markRef} className={styles.hipointsIcon}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img src={HIPOINTS_SRC} alt="" className={styles.hipointsGlyph} />
      </span>
    </span>
  );
}
