"use client";

import { useId, type CSSProperties } from "react";
import {
  colorBalanceToMatrix,
  useBackgroundSceneThemeBalance,
} from "@/components/BackgroundScene";
import {
  STONE_INPUT_ASSET_SRC,
  STONE_INPUT_IMAGE_HEIGHT,
  STONE_INPUT_IMAGE_WIDTH,
  STONE_INPUT_WIDTH_REM,
} from "./constants";
import { LanternSubmit } from "./LanternSubmit";
import styles from "./StoneInput.module.css";

export type StoneInputProps = {
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
  /** Viewport offset from the bottom while stuck (CSS `bottom`). Default 200. */
  stickyBottomPx?: number;
  /** Extra space below the stone so sticky releases before the page end. Default 200. */
  stickyStopMarginPx?: number;
};

export function StoneInput({
  subject,
  onSubjectChange,
  onSubmit,
  isLoading = false,
  inputRef,
  placeholder = "題 Subject",
  submitLabel = "詠む Compose",
  widthRem = STONE_INPUT_WIDTH_REM,
  sticky = false,
  stickyBottomPx = 0,
  stickyStopMarginPx = 0,
}: StoneInputProps) {
  const filterId = useId().replace(/:/g, "");
  const { global } = useBackgroundSceneThemeBalance();
  const colorMatrix = colorBalanceToMatrix(global);
  const canSubmit = Boolean(subject.trim()) && !isLoading;

  const rootStyle = {
    "--stone-input-width": `${widthRem}rem`,
    ...(sticky
      ? {
          "--stone-sticky-bottom": `${stickyBottomPx}px`,
          "--stone-sticky-stop-margin": `${stickyStopMarginPx}px`,
        }
      : {}),
  } as CSSProperties;

  return (
    <article
      className={[styles.root, sticky ? styles.rootSticky : null].filter(Boolean).join(" ")}
      style={rootStyle}
      aria-label="Haiku subject stone"
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
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative stone art from /public */}
        <img
          className={styles.image}
          src={STONE_INPUT_ASSET_SRC}
          alt=""
          width={STONE_INPUT_IMAGE_WIDTH}
          height={STONE_INPUT_IMAGE_HEIGHT}
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
