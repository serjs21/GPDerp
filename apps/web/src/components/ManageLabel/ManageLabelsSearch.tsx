"use client";

import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { ComicModalInput, ComicModalSearchPanel } from "@/components/ComicModalInput";
import type { ManageLabelsSearchProps } from "./ManageLabelsSearch.types";
import styles from "./ManageLabelsPanel.module.css";

/** Local label search in comic chrome or as a plain input; nothing when the header drives search. */
export function ManageLabelsSearch({ variant, inputRef, value, onChange }: ManageLabelsSearchProps) {
  const t = useTranslations("ManageLabel.panel");
  const inputProps = {
    ref: inputRef,
    type: "search" as const,
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    placeholder: t("searchPlaceholder"),
    "aria-label": t("searchAriaLabel"),
    autoComplete: "off" as const,
    spellCheck: false,
  };

  if (variant === "comic") {
    return (
      <div className={styles.searchChrome}>
        <ComicModalSearchPanel {...inputProps} />
      </div>
    );
  }
  if (variant === "plain") {
    return (
      <div className={styles.searchPlain}>
        <ComicModalInput {...inputProps} />
      </div>
    );
  }
  return null;
}
