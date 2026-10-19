"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { THEMES, type ThemeName } from "@/config/userConfiguration";
import { ThemeCookieSync } from "./ThemeCookieSync";

/**
 * React 19 warns when a `<script>` renders on the client. The theme script only needs to run from
 * the server HTML, so client renders mark it inert (next-themes sets suppressHydrationWarning).
 */
const THEME_SCRIPT_PROPS =
  typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: ThemeName;
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={initialTheme}
      themes={Object.values(THEMES)}
      enableSystem={false}
      storageKey="gpderp-theme"
      scriptProps={THEME_SCRIPT_PROPS}
    >
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
