"use client";

import { useTranslations } from "next-intl";
import { LanternSubmit } from "@/components/LanternSubmit";
import { HAIKU_TITLE_MAX_CHARS } from "@/consts/haiku/haikuTitleConsts";
import type { PostSignFormProps } from "./PostSignForm.types";
import styles from "./PostSignInput.module.css";

/** Haiku subject input with the lantern submit, enabled once a subject is typed. */
export function PostSignForm({
  subject,
  onSubjectChange,
  onSubmit,
  isLoading,
  inputRef,
  placeholder,
  submitLabel,
}: PostSignFormProps) {
  const t = useTranslations("PostSignInput");
  const canSubmit = Boolean(subject.trim()) && !isLoading;

  return (
    <form onSubmit={onSubmit} autoComplete="off" className={styles.form}>
      <input
        ref={inputRef}
        className={styles.input}
        value={subject}
        onChange={(e) => onSubjectChange(e.target.value)}
        maxLength={HAIKU_TITLE_MAX_CHARS}
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
  );
}
