import { useTranslations } from "next-intl";
import { FETCHING_LOADER_FRAMES, FETCHING_LOADER_REST_FRAME } from "./consts/fetchingLoaderConsts";
import type { FetchingLoaderProps } from "./FetchingLoader.types";
import { buildFetchingLoaderStyle, fetchingFrameStyle } from "./utils/fetchingLoaderUtils";
import styles from "./FetchingLoader.module.css";

/**
 * Running dog drawn as four stacked frames, played 1 2 3 4 3 2 (ping-pong) on a fixed CSS step clock.
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
      {FETCHING_LOADER_FRAMES.map((frame, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- static public SVG frames
        <img
          key={frame.src}
          className={styles.frame}
          style={fetchingFrameStyle(frame)}
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
