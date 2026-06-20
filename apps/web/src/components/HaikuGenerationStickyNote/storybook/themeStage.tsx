import type { CSSProperties, ReactNode } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getThemeScaleVars } from "@/theme/themeScale";

const THEME_SCALES: Record<ThemeName, number> = {
  "night-sky": 100,
  "tokyo-dusk": 50,
  sumie: 0,
};

export function themeStageStyle(theme: ThemeName): CSSProperties {
  const vars = getThemeScaleVars(THEME_SCALES[theme]);
  return vars as CSSProperties;
}

export function ThemeStage({
  theme,
  children,
}: {
  theme: ThemeName;
  children: ReactNode;
}) {
  return (
    <div style={{ ...themeStageStyle(theme), padding: "1rem", minHeight: "12rem" }}>
      {children}
    </div>
  );
}
