import { useTranslations } from "next-intl";
import { formatMfgDate } from "@/utils/date";
import styles from "./MfgDate.module.css";

export type MfgDateProps = {
  date: string | Date;
  className?: string;
  /** Accessible label; defaults to "Created". */
  label?: string;
};

/** Pixel-font product-stamp date, e.g. `MFG 01 MAY 2024`. */
export function MfgDate({ date, className, label }: MfgDateProps) {
  const t = useTranslations("MfgDate");
  const text = formatMfgDate(date);
  if (!text) return null;
  const value = typeof date === "string" ? new Date(date) : date;

  return (
    <time
      className={[styles.root, className].filter(Boolean).join(" ")}
      dateTime={value.toISOString()}
      aria-label={`${label ?? t("defaultLabel")} ${text.replace(/^MFG /, "")}`}
    >
      {text}
    </time>
  );
}
