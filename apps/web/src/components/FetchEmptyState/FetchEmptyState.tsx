import { useTranslations } from "next-intl";
import { FETCH_EMPTY_STATE_ASSET } from "./consts/fetchEmptyStateConsts";
import type { FetchEmptyStateProps } from "./FetchEmptyState.types";
import styles from "./FetchEmptyState.module.css";

/** Empty list: the fetching dog's "nothing here" art above its caption. */
export function FetchEmptyState({ className }: FetchEmptyStateProps) {
  const t = useTranslations("FetchEmptyState");

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} role="status">
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img
        className={styles.art}
        src={FETCH_EMPTY_STATE_ASSET.src}
        alt=""
        width={FETCH_EMPTY_STATE_ASSET.width}
        height={FETCH_EMPTY_STATE_ASSET.height}
        draggable={false}
      />
      <p className={styles.caption}>{t("caption")}</p>
    </div>
  );
}
