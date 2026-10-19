"use client";

import { useTheme } from "@/hooks/useTheme";

/** Mirrors the resolved theme into the SSR cookie on every page, so the next server render matches. */
export function ThemeCookieSync() {
  useTheme();
  return null;
}
