"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { DaylightBackgroundScene } from "@/components/DaylightBackground/DaylightBackgroundScene";
import { ThemeSelector } from "@/components/ThemeSelector/ThemeSelector";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import styles from "../WisdomBranch.stories.module.css";

const THEME_SCALE: Record<ThemeName, number> = {
  "night-sky": 100,
  "tokyo-dusk": 50,
  sumie: 0,
};

export type WisdomBranchStoryStageProps = {
  children: ReactNode;
  initialTheme?: ThemeName;
};

export function WisdomBranchStoryStage({
  children,
  initialTheme = "tokyo-dusk",
}: WisdomBranchStoryStageProps) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  const activeScale = preview ?? THEME_SCALE[theme];
  const themeVars = getThemeScaleVars(activeScale);

  return (
    <div className={styles.stageRoot} style={themeVars as CSSProperties} data-theme={theme}>
      <div className={styles.stagePage}>
        <DaylightBackgroundScene progress={activeScale} />
        <main className={styles.stageMain}>
          <div className={styles.stageControls}>
            <div className={styles.selectorCard}>
              <ThemeSelector
                value={theme}
                onChange={setTheme}
                onPreviewChange={setPreview}
                onScaleCommit={(progress) => {
                  setPreview(progress);
                  setTheme(getPersistedThemeFromScale(progress));
                }}
                ariaLabel="Storybook theme"
              />
              <p className={styles.themeLabel}>Theme: {theme}</p>
            </div>
          </div>
          <div className={styles.stageContent}>{children}</div>
        </main>
      </div>
    </div>
  );
}
