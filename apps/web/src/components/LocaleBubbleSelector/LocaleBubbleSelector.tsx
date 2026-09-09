"use client";

import type { ComponentType } from "react";
import { Languages } from "lucide-react";
import { DE, ES, FR, IT, JP, PT, TH, US } from "country-flag-icons/react/3x2";
import {
  TextBubbleDropdown,
  type TextBubbleDropDirection,
  type TextBubbleTailDirection,
} from "@/components/TextBubbleDropdown";
import type { AppLocale } from "@/config/userConfiguration";
import type { LocaleOption } from "@/components/LocaleSelector";
import styles from "./LocaleBubbleSelector.module.css";

type FlagComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

const LOCALE_FLAGS: Partial<Record<AppLocale, FlagComponent>> = {
  en: US,
  ja: JP,
  es: ES,
  fr: FR,
  th: TH,
  de: DE,
  it: IT,
  pt: PT,
};

export type LocaleBubbleSelectorProps = {
  value: AppLocale;
  options: LocaleOption[];
  onChange: (next: AppLocale) => void;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  dropDirection?: TextBubbleDropDirection;
  tailDirection?: TextBubbleTailDirection;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

/**
 * Locale picker using the comic TextBubbleDropdown shell (Storybook-style speech menu).
 */
export function LocaleBubbleSelector({
  value,
  options,
  onChange,
  className,
  ariaLabel,
  placeholder = "Language",
  dropDirection = "down",
  tailDirection = "top-left",
  open,
  defaultOpen,
  onOpenChange,
  disabled,
}: LocaleBubbleSelectorProps) {
  const SelectedFlag = LOCALE_FLAGS[value];
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;
  const mergedAriaLabel = ariaLabel ?? `Language: ${selectedLabel}`;

  return (
    <TextBubbleDropdown
      className={[styles.root, className].filter(Boolean).join(" ")}
      options={options.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
      value={value}
      onChange={(next) => onChange(next as AppLocale)}
      placeholder={placeholder}
      dropDirection={dropDirection}
      tailDirection={tailDirection}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      renderTrigger={() => (
        <span className={styles.triggerInner} aria-label={mergedAriaLabel}>
          {SelectedFlag ? (
            <SelectedFlag className={styles.flag} aria-hidden />
          ) : (
            <Languages className={styles.fallbackIcon} aria-hidden />
          )}
        </span>
      )}
      renderOption={({ option, selected }) => {
        const locale = option.value as AppLocale;
        const OptionFlag = LOCALE_FLAGS[locale];
        return (
          <>
            {OptionFlag ? (
              <OptionFlag className={styles.flag} aria-hidden />
            ) : (
              <Languages className={styles.fallbackIcon} aria-hidden />
            )}
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={styles.localeCode} aria-hidden>
              {locale.toUpperCase()}
            </span>
            {selected ? (
              <span className={styles.check} aria-hidden>
                ✓
              </span>
            ) : (
              <span className={styles.checkSpacer} aria-hidden />
            )}
          </>
        );
      }}
    />
  );
}
