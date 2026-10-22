"use client";

import { Dropdown } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import type { AppLocale } from "@/config/userConfiguration";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CN, DE, ES, FR, IT, JP, PT, TH, US, VN } from "country-flag-icons/react/3x2";
import styles from "./LocaleSelector.module.css";

const ICON_BUTTON_PADDING_PX = 4;

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
  zh: CN,
  vi: VN,
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightMatches = (text: string, query: string, searchMatchClass: string): ReactNode => {
  const q = query.trim();
  if (!q) return text;
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  const tokenRe = new RegExp(`^${escapeRegExp(q)}$`, "i");
  const parts = text.split(re);
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "") continue;
    if (tokenRe.test(part)) {
      nodes.push(
        <mark key={`m-${i}-${part}`} className={searchMatchClass}>
          {part}
        </mark>,
      );
    } else {
      nodes.push(part);
    }
  }
  return nodes.length === 0 ? text : nodes;
};

export type LocaleOption = { value: AppLocale; label: string };

type LocaleSelectorProps = {
  value: AppLocale;
  options: LocaleOption[];
  onChange: (next: AppLocale) => void;
  className?: string;
  ariaLabel?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
};

export const LocaleSelector = ({
  value,
  options,
  onChange,
  className,
  ariaLabel,
  getPopupContainer,
}: LocaleSelectorProps) => {
  const t = useTranslations("Profile");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const labelByValue = useMemo(
    () =>
      options.reduce(
        (acc, option) => {
          acc[option.value] = option.label;
          return acc;
        },
        {} as Record<AppLocale, string>,
      ),
    [options],
  );

  const selectedLabel = labelByValue[value] ?? value;
  const SelectedFlag = LOCALE_FLAGS[value];

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const lab = labelByValue[opt.value] ?? opt.value;
      return lab.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q);
    });
  }, [labelByValue, options, searchQuery]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) setSearchQuery("");
      else requestAnimationFrame(() => searchInputRef.current?.focus());
    },
    [],
  );

  const selectLocale = useCallback(
    (next: AppLocale) => {
      setSearchQuery("");
      setIsOpen(false);
      onChange(next);
    },
    [onChange],
  );

  const mergedAriaLabel = ariaLabel ?? t("languageAriaLabel", { language: selectedLabel });

  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ""}`}>
      <Dropdown
        open={isOpen}
        onOpenChange={onOpenChange}
        trigger={["click"]}
        placement="bottomRight"
        getPopupContainer={getPopupContainer}
        popupRender={() => (
          <div className={styles.panel}>
            <input
              ref={searchInputRef}
              type="search"
              className={styles.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("languageSearchPlaceholder")}
              aria-label={t("languageSearchPlaceholder")}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            {filteredOptions.length === 0 ? (
              <p className={styles.empty}>{t("languageNoMatches")}</p>
            ) : (
              <ul className={styles.list} role="listbox" aria-label={t("language")}>
                {filteredOptions.map((option) => {
                  const OptionFlag = LOCALE_FLAGS[option.value];
                  const isSelected = option.value === value;
                  const codeUpper = option.value.toUpperCase();
                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        aria-current={isSelected ? "true" : undefined}
                        className={styles.option}
                        onClick={() => selectLocale(option.value)}
                      >
                        {OptionFlag ? (
                          <OptionFlag className={styles.localeFlag} aria-hidden />
                        ) : (
                          <Languages className={styles.localeFallbackIcon} aria-hidden />
                        )}
                        <span className={styles.localeOptionLabel}>
                          {highlightMatches(option.label, searchQuery, styles.searchMatch)}
                        </span>
                        <span className={styles.localeCode} aria-hidden>
                          {highlightMatches(codeUpper, searchQuery, styles.searchMatch)}
                        </span>
                        {isSelected ? <span className={styles.localeCurrent}>{t("languageCurrent")}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      >
        <UIButton
          className={styles.trigger}
          aria-label={mergedAriaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          style={
            {
              "--icon-button-padding": `${ICON_BUTTON_PADDING_PX}px`,
            } as CSSProperties
          }
        >
          {SelectedFlag ? (
            <SelectedFlag className={styles.flagTrigger} aria-hidden />
          ) : (
            <Languages className={styles.fallbackIcon} aria-hidden />
          )}
        </UIButton>
      </Dropdown>
    </div>
  );
};
