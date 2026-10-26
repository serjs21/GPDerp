import { useTranslations } from "next-intl";
import { LOADING_TEXT_DOT_COUNT } from "./consts/loadingTextConsts";
import type { LoadingTextProps } from "./LoadingText.types";
import { buildLoadingTextStyle } from "./utils/loadingTextUtils";
import styles from "./LoadingText.module.css";

const DOT_INDEXES = Array.from({ length: LOADING_TEXT_DOT_COUNT }, (_, index) => index);

/**
 * Comic "Loading" caption that gains a dot every `stepMs`. Decorative: the surrounding loader announces status.
 * Word and dots are CSS-generated, so tools reading the HTML text (crawlers, site scanners) don't take the
 * server-rendered loader for the page's content.
 */
export function LoadingText({ className, stepMs }: LoadingTextProps) {
  const t = useTranslations("Loaders.loadingText");

  return (
    <span
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={stepMs === undefined ? undefined : buildLoadingTextStyle(stepMs)}
      data-loading-text={t("text")}
      aria-hidden
    >
      {DOT_INDEXES.map((index) => (
        <span key={index} className={styles.dot} />
      ))}
    </span>
  );
}
