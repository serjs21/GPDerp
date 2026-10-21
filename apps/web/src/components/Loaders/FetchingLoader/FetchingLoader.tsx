import { useTranslations } from "next-intl";
import { FETCHING_LOADER_REST_FRAME } from "./consts/fetchingLoaderConsts";
import type { FetchingLoaderProps } from "./FetchingLoader.types";
import { buildFetchingLoaderStyle, fetchingFrameStyle, fetchingShownFrames } from "./utils/fetchingLoaderUtils";
import styles from "./FetchingLoader.module.css";

const SHOWN_FRAMES = fetchingShownFrames();

/**
 * Running dog drawn as stacked frames, played 1 2 1 3 on a fixed CSS step clock.
 * CSS-only: no timers, server-safe.
 */
export function FetchingLoader(props: FetchingLoaderProps) {
  const t = useTranslations("Loaders.fetchingLoader");

  return (
    <div
      className={[styles.root, props.className].filter(Boolean).join(" ")}
      style={buildFetchingLoaderStyle(props)}
      role="status"
      aria-label={t("ariaLabel")}
    >
      {SHOWN_FRAMES.map(({ frame, index }) => (
        // eslint-disable-next-line @next/next/no-img-element -- static public SVG frames
        <img
          key={frame.src}
          className={styles.frame}
          style={fetchingFrameStyle(frame)}
          data-frame={index + 1}
          data-rest={index === FETCHING_LOADER_REST_FRAME || undefined}
          src={frame.src}
          alt=""
          width={frame.width}
          height={frame.height}
          draggable={false}
        />
      ))}
    </div>
  );
}
