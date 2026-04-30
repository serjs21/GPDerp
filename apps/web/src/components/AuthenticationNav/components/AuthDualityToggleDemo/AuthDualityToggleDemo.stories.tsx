import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import { ThemeSelector } from "@/components/ThemeSelector/ThemeSelector";
import { AuthDualityToggleDemo } from "./AuthDualityToggleDemo";

const meta = {
  title: "Components/AuthenticationNav/AuthDualityToggleDemo",
  component: AuthDualityToggleDemo,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AuthDualityToggleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
        <AuthDualityToggleDemo />
      </div>
    );
  },
};
