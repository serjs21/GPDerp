"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSettingsSearchOpenState } from "./useSettingsSearchOpenState";

const SEARCH_DEBOUNCE_MS = 200;

type SettingsSearchTab = "share-links" | "labels";

function parseSearchableTab(value: string | null): SettingsSearchTab | null {
  if (value === "share-links" || value === "labels") return value;
  return null;
}

const COPY: Record<
  SettingsSearchTab,
  { placeholderKey: string; ariaLabelKey: string; buttonAriaLabelKey: string; iconSrc: string }
> = {
  "share-links": {
    placeholderKey: "shareLinks.placeholder",
    ariaLabelKey: "shareLinks.ariaLabel",
    buttonAriaLabelKey: "shareLinks.buttonAriaLabel",
    iconSrc: "/profile/search_links.svg",
  },
  labels: {
    placeholderKey: "labels.placeholder",
    ariaLabelKey: "labels.ariaLabel",
    buttonAriaLabelKey: "labels.buttonAriaLabel",
    iconSrc: "/profile/seach_label.svg",
  },
};

/**
 * Header search for `/settings` share-links and labels tabs.
 * Open by default and toggled by the icon; on narrow headers closed by default
 * and also collapses on blur when empty (see `useSettingsSearchOpenState`).
 */
export function useHeaderSettingsSearch() {
  const t = useTranslations("HeaderHaikuTools.settingsSearch");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseSearchableTab(searchParams.get("tab"));
  const enabled = pathname.startsWith("/settings") && tab != null;

  const urlSearch = searchParams.get("search") ?? "";
  const [draft, setDraft] = useState(urlSearch);
  const { expanded, toggleExpanded, onSearchPointerDown, onInputBlur } = useSettingsSearchOpenState(
    enabled,
    tab,
    draft,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(urlSearch);
  }, [urlSearch, tab]);

  useEffect(() => {
    if (!enabled || !expanded) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [enabled, expanded, tab]);

  const commitSearch = useCallback(
    (value: string) => {
      if (!enabled || !tab) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      const trimmed = value.trim();
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      router.replace(`/settings?${params.toString()}`, { scroll: false });
    },
    [enabled, tab, router, searchParams],
  );

  useEffect(() => {
    if (!enabled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (draft.trim() === urlSearch.trim()) return;
      commitSearch(draft);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [draft, enabled, urlSearch, commitSearch]);

  const copy = tab ? COPY[tab] : COPY["share-links"];

  return {
    enabled,
    tab,
    expanded,
    toggleExpanded,
    onSearchPointerDown,
    onInputBlur,
    searchString: draft,
    setSearchString: setDraft,
    inputRef,
    placeholder: t(copy.placeholderKey),
    ariaLabel: t(copy.ariaLabelKey),
    buttonAriaLabel: t(copy.buttonAriaLabelKey),
    iconSrc: copy.iconSrc,
  };
}
