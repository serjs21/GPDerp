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
  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "baf7a7" },
    body: JSON.stringify({
      sessionId: "baf7a7",
      runId: "pre-fix",
      hypothesisId: "C",
      location: "ThemeProvider.tsx:render",
      message: "theme provider hydration snapshot",
      data: {
        isServer: typeof window === "undefined",
        initialTheme,
        htmlTheme: typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : null,
        storedTheme: typeof window !== "undefined" ? window.localStorage.getItem("gpderp-theme") : null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
