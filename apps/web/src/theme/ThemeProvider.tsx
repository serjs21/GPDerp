"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { THEMES, type ThemeName } from "@/config/userConfiguration";

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
    >
      {children}
    </NextThemesProvider>
  );
}
