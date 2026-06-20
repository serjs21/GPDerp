"use client";

import { WritingLoader } from "@/components/Loaders";
import { HaikuGenerationStickyNoteShell } from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import styles from "./HaikuGenerationStickyNoteInput.module.css";

export type HaikuGenerationStickyNoteInputProps = {
  subject: string;
  onSubjectChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  submitLabel?: string;
};

export function HaikuGenerationStickyNoteInput({
  subject,
  onSubjectChange,
  onSubmit,
  isLoading = false,
  inputRef,
  placeholder = "題 Subject",
  submitLabel = "詠む Compose",
}: HaikuGenerationStickyNoteInputProps) {
  return (
    <HaikuGenerationStickyNoteShell rotate={0.3}>
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
    </HaikuGenerationStickyNoteShell>
  );
}
