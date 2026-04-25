import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import { ThemeSelector } from "./ThemeSelector";
import styles from "./ThemeSelector.stories.module.css";

const meta: Meta<typeof ThemeSelector> = {
  title: "Auth/ThemeSelector",
  component: ThemeSelector,
  args: {
    ariaLabel: "Theme",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeSelector>;

const InteractiveSelector = ({ initialTheme }: { initialTheme: ThemeName }) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
  const themeVars = getThemeScaleVars(activeScale);

  return (
    <div
      className={styles.stage}
      style={
        {
          "--story-background": themeVars["--background"],
          "--story-text": themeVars["--text-color"],
          "--story-border": themeVars["--border-color"],
          "--story-gradient-start": themeVars["--gradientStart"],
          "--story-gradient-mid": themeVars["--gradientMid"],
          "--story-surface": themeVars["--surface-glass"],
          "--story-surface-strong": themeVars["--surface-glass-strong"],
          "--story-accent-soft": themeVars["--shrine-accent-soft"],
        } as CSSProperties
      }
    >
      <div className={styles.triangleBack} aria-hidden />
      <div className={styles.triangleMid} aria-hidden />
      <div className={styles.triangleFront} aria-hidden />
      <div className={styles.card}>
      <ThemeSelector
        value={theme}
        onChange={setTheme}
        onPreviewChange={setPreview}
        onScaleCommit={(progress) => {
          setPreview(progress);
          setTheme(getPersistedThemeFromScale(progress));
        }}
      />
      <p className={styles.title}>Theme: {theme}</p>
      <p className={styles.scaleLabel}>
        Scale: {activeScale}% (night to twilight to sunset to day)
      </p>
      </div>
    </div>
  );
};

export const Bright: Story = {
  render: () => <InteractiveSelector initialTheme="sumie" />,
};

export const Mid: Story = {
  render: () => <InteractiveSelector initialTheme="tokyo-dusk" />,
};

export const Dark: Story = {
  render: () => <InteractiveSelector initialTheme="night-sky" />,
};

export const ScaleProgression: Story = {
  render: () => <InteractiveSelector initialTheme="tokyo-dusk" />,
};
