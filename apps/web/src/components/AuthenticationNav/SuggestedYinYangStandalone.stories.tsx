import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import { ThemeSelector } from "@/components/ThemeSelector/ThemeSelector";
import { SuggestedLineOnlyButton } from "../../../local/suggested-yinyang-standalone/SuggestedLineOnlyButton";
import { DaoLogin } from "../../../local/suggested-yinyang-standalone/DaoLogin";
import { SuggestedLiquidYinYangAuthToggle } from "../../../local/suggested-yinyang-standalone/SuggestedLiquidYinYangAuthToggle";

const meta = {
  title: "Suggested/AuthenticationNav/MinimalStandaloneAnimated",
  component: DaoLogin,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Standalone minimal DaoRotation-based prototype stories.",
      },
    },
  },
} satisfies Meta<typeof DaoLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LineWithSquareBackground: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
    const themeVars = getThemeScaleVars(activeScale);

    return (
      <div style={themeVars as CSSProperties}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <ThemeSelector
            value={theme}
            onChange={setTheme}
            onPreviewChange={setPreview}
            onScaleCommit={(progress) => {
              setPreview(progress);
              setTheme(getPersistedThemeFromScale(progress));
            }}
          />
        </div>
        <div className="yy-line-square-row">
          <SuggestedLineOnlyButton />
          <DaoLogin />
        </div>
      </div>
    );
  },
};

export const LiquidYinYangToggle: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
    const themeVars = getThemeScaleVars(activeScale);

    return (
      <div style={themeVars as CSSProperties}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <ThemeSelector
            value={theme}
            onChange={setTheme}
            onPreviewChange={setPreview}
            onScaleCommit={(progress) => {
              setPreview(progress);
              setTheme(getPersistedThemeFromScale(progress));
            }}
          />
        </div>
        <SuggestedLiquidYinYangAuthToggle />
      </div>
    );
  },
};

