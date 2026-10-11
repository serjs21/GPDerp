"use client";

import { useRef, type ComponentType } from "react";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { DE, ES, FR, IT, JP, PT, TH, US } from "country-flag-icons/react/3x2";
import {
  TextBubbleDropdown,
  type TextBubbleDropDirection,
  type TextBubbleTailDirection,
} from "@/components/TextBubbleDropdown";
import type { AppLocale } from "@/config/userConfiguration";
import type { LocaleOption } from "@/components/LocaleSelector";
import { nativeLanguageLabel } from "./localeLanguageLabels";
import { LocaleSearchHeader } from "./LocaleSearchHeader";
import { useFocusSearchOnPanelReady } from "./useFocusSearchOnPanelReady";
import { useLocaleSearchMenu } from "./useLocaleSearchMenu";
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
  /** Defaults to the dropdown's own `down` / `top-left`. */
  dropDirection?: TextBubbleDropDirection;
  tailDirection?: TextBubbleTailDirection;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

/**
 * Locale picker using the comic TextBubbleDropdown shell (Storybook-style speech menu).
 * Options show endonyms; search matches language names across all supported locales.
 */
export function LocaleBubbleSelector({
  value,
  options,
  onChange,
  className,
  ariaLabel,
  placeholder: placeholderProp,
  dropDirection,
  tailDirection,
  open: openProp,
  defaultOpen,
  onOpenChange,
  disabled,
}: LocaleBubbleSelectorProps) {
  const t = useTranslations("Profile");
  const placeholder = placeholderProp ?? t("language");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { open, handleOpenChange, searchQuery, setSearchQuery, filteredOptions } = useLocaleSearchMenu({
    options,
    openProp,
    defaultOpen,
    onOpenChange,
  });

  const SelectedFlag = LOCALE_FLAGS[value];
  const mergedAriaLabel =
    ariaLabel ?? t("languageAriaLabel", { language: nativeLanguageLabel(value) });

  useFocusSearchOnPanelReady(open, disabled, searchInputRef);

  return (
    <TextBubbleDropdown
      className={[styles.root, className].filter(Boolean).join(" ")}
      options={filteredOptions}
      value={value}
      onChange={(next) => onChange(next as AppLocale)}
      placeholder={placeholder}
      dropDirection={dropDirection}
      tailDirection={tailDirection}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      emptyMessage={t("languageNoMatches")}
      panelHeader={
        <LocaleSearchHeader
          inputRef={searchInputRef}
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("languageSearchPlaceholder")}
        />
      }
      renderTrigger={() => (
        <span className={styles.triggerInner} aria-label={mergedAriaLabel}>
          {SelectedFlag ? (
            <SelectedFlag className={styles.triggerFlag} aria-hidden />
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
