"use client";

import { useId, type CSSProperties } from "react";
import {
  colorBalanceToMatrix,
  useBackgroundSceneThemeBalance,
} from "@/components/BackgroundScene";
import { LanternSubmit } from "@/components/StoneInput/LanternSubmit";
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
  /** Stick to the viewport while scrolling within the page. */
  sticky?: boolean;
  /** Viewport offset from the bottom while stuck (CSS `bottom`). Default 0. */
  stickyBottomPx?: number;
  /** Extra space below the sign so sticky releases before the page end. Default 0. */
  stickyStopMarginPx?: number;
};

export function PostSignInput({
  subject,
  onSubjectChange,
  onSubmit,
  isLoading = false,
  inputRef,
  placeholder = "題 Subject",
  submitLabel = "詠む Compose",
  widthRem = POST_SIGN_INPUT_WIDTH_REM,
  sticky = false,
  stickyBottomPx = 0,
  stickyStopMarginPx = 0,
}: PostSignInputProps) {
  const filterId = useId().replace(/:/g, "");
  const { global } = useBackgroundSceneThemeBalance();
  const colorMatrix = colorBalanceToMatrix(global);
  const canSubmit = Boolean(subject.trim()) && !isLoading;

  const rootStyle = {
    "--post-sign-input-width": `${widthRem}rem`,
    ...(sticky
      ? {
          "--post-sign-sticky-bottom": `${stickyBottomPx}px`,
          "--post-sign-sticky-stop-margin": `${stickyStopMarginPx}px`,
        }
      : {}),
  } as CSSProperties;

  return (
    <article
      className={[styles.root, sticky ? styles.rootSticky : null].filter(Boolean).join(" ")}
      style={rootStyle}
      aria-label="Haiku subject sign"
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
          placeholder={placeholder}
          aria-label="Haiku subject"
        />
        <LanternSubmit
          className={styles.submit}
          disabled={!canSubmit}
          active={canSubmit}
          aria-label={submitLabel}
        />
      </form>
    </article>
  );
}
