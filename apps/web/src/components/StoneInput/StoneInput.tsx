"use client";

import type { CSSProperties } from "react";
import { WritingLoader } from "@/components/Loaders";
import {
  STONE_INPUT_ASSET_SRC,
  STONE_INPUT_IMAGE_HEIGHT,
  STONE_INPUT_IMAGE_WIDTH,
  STONE_INPUT_WIDTH_REM,
} from "./constants";
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
}: StoneInputProps) {
  const rootStyle = {
    "--stone-input-width": `${widthRem}rem`,
  } as CSSProperties;

  return (
    <article className={styles.root} style={rootStyle} aria-label="Haiku subject stone">
      <div className={styles.shell} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative stone art from /public */}
        <img
          className={styles.image}
          src={STONE_INPUT_ASSET_SRC}
          alt=""
          width={STONE_INPUT_IMAGE_WIDTH}
          height={STONE_INPUT_IMAGE_HEIGHT}
          draggable={false}
          decoding="async"
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
        <button
          type="submit"
          className={styles.submit}
          disabled={isLoading || !subject.trim().length}
        >
          {isLoading ? (
            <span className={styles.submitLoader}>
              <WritingLoader variant="pen" />
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </form>
    </article>
  );
}
