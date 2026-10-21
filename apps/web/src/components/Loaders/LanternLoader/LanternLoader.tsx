import { useTranslations } from "next-intl";
import { LANTERN_LOADER_ASSET, LANTERN_LOADER_DOT_COUNT } from "./consts/lanternLoaderConsts";
import type { LanternLoaderProps } from "./LanternLoader.types";
import { buildLanternKeyframes, buildLanternStyle, lanternKeyframesName, resolveLanternProps } from "./utils/lanternLoaderUtils";
import styles from "./LanternLoader.module.css";

const DOT_INDEXES = Array.from({ length: LANTERN_LOADER_DOT_COUNT }, (_, index) => index);

/**
 * Lantern that steps through a configurable list of still frames (rotation, x/y, scale, opacity), holding
 * each for `stepTransitionMs`, looping, under a "Loading" caption that gains a dot per step.
 * CSS-only: the keyframes are generated from the steps, no timers.
 */
export function LanternLoader(props: LanternLoaderProps) {
  const t = useTranslations("Loaders.lanternLoader");
  const resolved = resolveLanternProps(props);
  const keyframesName = resolved.steps.length > 0 ? lanternKeyframesName(resolved.steps) : null;

  return (
    <div
      className={[styles.root, props.className].filter(Boolean).join(" ")}
      style={buildLanternStyle(resolved, keyframesName)}
      role="status"
      aria-label={t("ariaLabel")}
    >
      {keyframesName ? (
        // React 19 hoists this into <head> and dedupes it by href across identical lanterns.
        <style href={keyframesName} precedence="default">
          {buildLanternKeyframes(keyframesName, resolved.steps)}
        </style>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img
        className={styles.lantern}
        src={LANTERN_LOADER_ASSET.src}
        alt=""
        width={LANTERN_LOADER_ASSET.width}
        height={LANTERN_LOADER_ASSET.height}
        draggable={false}
      />
      <span className={styles.text} aria-hidden>
        {t("text")}
        {DOT_INDEXES.map((index) => (
          <span key={index} className={styles.dot}>
            .
          </span>
        ))}
      </span>
    </div>
  );
}
