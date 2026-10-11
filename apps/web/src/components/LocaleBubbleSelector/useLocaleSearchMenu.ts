"use client";

import { useCallback, useMemo, useState } from "react";
import type { LocaleOption } from "@/components/LocaleSelector";
import { languageMatchesQuery, nativeLanguageLabel } from "./localeLanguageLabels";

type LocaleSearchMenuOptions = {
  options: LocaleOption[];
  openProp: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange?: (open: boolean) => void;
};

/** Open state (controlled or uncontrolled) and the language search that resets on close. */
export function useLocaleSearchMenu({
  options,
  openProp,
  defaultOpen = false,
  onOpenChange,
}: LocaleSearchMenuOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  const labeledOptions = useMemo(
    () =>
      options.map((option) => ({
        value: option.value,
        label: nativeLanguageLabel(option.value),
      })),
    [options],
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return labeledOptions;
    return labeledOptions.filter((option) => languageMatchesQuery(option.value, searchQuery));
  }, [labeledOptions, searchQuery]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
      if (!next) setSearchQuery("");
    },
    [isControlled, onOpenChange],
  );

  return { open, handleOpenChange, searchQuery, setSearchQuery, filteredOptions };
}
