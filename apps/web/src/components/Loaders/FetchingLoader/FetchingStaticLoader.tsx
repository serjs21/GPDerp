// Server-safe (no "use client", no inline styles): defaults fixed in FetchingStaticLoader.module.css.
import { useTranslations } from "next-intl";
import { FETCHING_LOADER_REST_FRAME } from "./consts/fetchingLoaderConsts";
import type { FetchingStaticLoaderProps } from "./FetchingStaticLoader.types";
import { fetchingShownFrames } from "./utils/fetchingLoaderUtils";
import styles from "./FetchingLoader.module.css";
import staticStyles from "./FetchingStaticLoader.module.css";

const SHOWN_FRAMES = fetchingShownFrames();

/** FetchingLoader on its defaults (same frames and keyframes) above a "Fetching..." caption. */
export function FetchingStaticLoader({ className }: FetchingStaticLoaderProps) {
  const t = useTranslations("Loaders.fetchingLoader");

  return (
    <div className={[staticStyles.wrap, className].filter(Boolean).join(" ")} role="status">
      <div className={`${styles.root} ${staticStyles.defaults}`} aria-hidden>
        {SHOWN_FRAMES.map(({ frame, index }) => (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG frames
          <img
            key={frame.src}
            className={`${styles.frame} ${staticStyles[`frame${index + 1}`] ?? ""}`}
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
      <p className={staticStyles.caption}>{t("text")}</p>
    </div>
  );
}
