"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ThemeName } from "@/config/userConfiguration";

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme: ThemeName;
}

export const ThemeProvider = ({ children, initialTheme }: ThemeProviderProps) => {
  return (
    <NextThemeProvider
      attribute="data-theme"
      enableSystem={false}
      themes={["tokyo-dusk", "sumie", "night-sky"]}
      defaultTheme={initialTheme}
      forcedTheme={undefined}
      storageKey="gpderp-theme"
    >
      {children}
    </NextThemeProvider>
  );
};
