"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  colorBalanceToMatrix,
  useBackgroundSceneThemeBalance,
} from "@/components/BackgroundScene";
import { LanternSubmit } from "@/components/LanternSubmit";
import {
  POST_SIGN_INPUT_ASSET_SRC,
  POST_SIGN_INPUT_IMAGE_HEIGHT,
  POST_SIGN_INPUT_IMAGE_WIDTH,
  POST_SIGN_INPUT_WIDTH_REM,
} from "./constants";
import styles from "./PostSignInput.module.css";

export type PostSignInputProps = {
  subject: string;
  onSubjectChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  submitLabel?: string;
  widthRem?: number;
  /** Pin to the viewport; rides up to stay above `footer`. */
  sticky?: boolean;
  /** Extra offset from the bottom while pinned (CSS `bottom`). Default 0. */
  stickyBottomPx?: number;
  /** Extra gap above the footer when the pin releases. Default 0. */
  stickyStopMarginPx?: number;
};

function useFooterClearance(enabled: boolean) {
  const [clearancePx, setClearancePx] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const footer = document.querySelector("footer");
    if (!footer) return;

    const update = () => {
      const top = footer.getBoundingClientRect().top;
      setClearancePx(Math.max(0, window.innerHeight - top));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(footer);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [enabled]);

  return clearancePx;
}

export function PostSignInput({
  subject,
  onSubjectChange,
  onSubmit,
  isLoading = false,
  inputRef,
  placeholder,
  submitLabel,
  widthRem = POST_SIGN_INPUT_WIDTH_REM,
  sticky = false,
  stickyBottomPx = 20,
  stickyStopMarginPx = 0,
}: PostSignInputProps) {
  const t = useTranslations("PostSignInput");
  const filterId = useId().replace(/:/g, "");
  const { global } = useBackgroundSceneThemeBalance();
  const colorMatrix = colorBalanceToMatrix(global);
  const canSubmit = Boolean(subject.trim()) && !isLoading;
  const footerClearancePx = useFooterClearance(sticky);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!sticky) return;
    setPortalRoot(document.body);
  }, [sticky]);

  const rootStyle = {
    "--post-sign-input-width": `${widthRem}rem`,
    ...(sticky
      ? {
          "--post-sign-sticky-bottom": `${stickyBottomPx + stickyStopMarginPx + footerClearancePx}px`,
        }
      : {}),
  } as CSSProperties;

  const article = (
    <article
      className={[styles.root, sticky ? styles.rootSticky : null].filter(Boolean).join(" ")}
      style={rootStyle}
      aria-label={t("signAriaLabel")}
    >
      <svg className={styles.filterDefs} aria-hidden>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={colorMatrix} />
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

      <form onSubmit={onSubmit} autoComplete="off" className={styles.form}>
        <input
          ref={inputRef}
          className={styles.input}
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
          autoFocus
          placeholder={placeholder ?? t("placeholder")}
          aria-label={t("inputAriaLabel")}
        />
        <LanternSubmit
          className={styles.submit}
          disabled={!canSubmit}
          active={canSubmit}
          aria-label={submitLabel ?? t("submitLabel")}
        />
      </form>
    </article>
  );

  if (sticky) {
    return portalRoot ? createPortal(article, portalRoot) : null;
  }
  return article;
}
