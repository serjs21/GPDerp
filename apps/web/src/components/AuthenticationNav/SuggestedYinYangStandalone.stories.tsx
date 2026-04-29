import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import { ThemeSelector } from "@/components/ThemeSelector/ThemeSelector";
import { SuggestedLiquidYinYangAuthToggleAnimeWhirlpool } from "../../../local/suggested-yinyang-standalone/SuggestedLiquidYinYangAuthToggleAnimeWhirlpool";
import { WashInSea, type WashDirection } from "../../../local/suggested-yinyang-standalone/wash-in-sea/WashInSea";
import { BlackHoleWhirlpool } from "../../../local/suggested-yinyang-standalone/wash-in-sea/BlackHoleWhirlpool";

const meta = {
  title: "Suggested/AuthenticationNav/MinimalStandaloneAnimated",
  component: SuggestedLiquidYinYangAuthToggleAnimeWhirlpool,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Selected standalone animated auth toggle + reusable text animations.",
      },
    },
  },
} satisfies Meta<typeof SuggestedLiquidYinYangAuthToggleAnimeWhirlpool>;

export default meta;
type Story = StoryObj<typeof meta>;
type WashInSeaStoryArgs = {
  direction: WashDirection;
  duration: number;
};
type BlackHoleStoryArgs = {
  duration: number;
  rotationSpeed: number;
  insideEaseInPower: number;
  containerWidth: number;
  containerHeight: number;
  displayText: string;
};

export const LiquidYinYangToggleAnimeWhirlpoolHover: Story = {
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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <SuggestedLiquidYinYangAuthToggleAnimeWhirlpool />
        </div>
      </div>
    );
  },
};

export const LiquidYinYangToggleAnimeWhirlpoolSquareCorners: Story = {
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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <SuggestedLiquidYinYangAuthToggleAnimeWhirlpool borderRadius={0} width={220} />
        </div>
      </div>
    );
  },
};

export const WashInSeaAnimation: Story = {
  args: {
    direction: "right",
    duration: 1900,
  } as WashInSeaStoryArgs,
  argTypes: {
    direction: {
      control: { type: "select" },
      options: ["left", "right", "up", "down"],
    },
    duration: {
      control: { type: "range", min: 500, max: 6000, step: 100 },
    },
  },
  render: (args) => {
    const { direction, duration } = args as WashInSeaStoryArgs;
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
    const themeVars = getThemeScaleVars(activeScale);
    const animationKey = `${direction}-${duration}`;

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
        <div style={{ display: "flex", justifyContent: "center", fontSize: 14, marginBottom: 8 }}>
          Direction: {direction} | Duration: {duration}ms
        </div>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
          <WashInSea key={animationKey} direction={direction} duration={duration}>
            Login Register — carried by sea
          </WashInSea>
        </div>
      </div>
    );
  },
};

export const BlackHoleWhirlpoolAnimation: Story = {
  args: {
    duration: 1900,
    rotationSpeed: 1,
    insideEaseInPower: 2,
    containerWidth: 520,
    containerHeight: 120,
    displayText: "Login Register - pulled into black hole",
  } as BlackHoleStoryArgs,
  argTypes: {
    duration: {
      control: { type: "range", min: 500, max: 6000, step: 100 },
    },
    rotationSpeed: {
      control: { type: "range", min: 0.2, max: 4, step: 0.05 },
    },
    insideEaseInPower: {
      control: { type: "range", min: 1, max: 5, step: 0.1 },
    },
    containerWidth: {
      control: { type: "range", min: 180, max: 800, step: 10 },
    },
    containerHeight: {
      control: { type: "range", min: 44, max: 260, step: 2 },
    },
    displayText: {
      control: { type: "text" },
    },
  },
  render: (args) => {
    const {
      duration,
      rotationSpeed,
      insideEaseInPower,
      displayText,
      containerWidth,
      containerHeight,
    } = args as BlackHoleStoryArgs;
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
    const themeVars = getThemeScaleVars(activeScale);
    const animationKey = `${displayText}-${duration}-${rotationSpeed}-${insideEaseInPower}-${containerWidth}-${containerHeight}`;

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
        <div style={{ display: "flex", justifyContent: "center", fontSize: 14, marginBottom: 8 }}>
          Duration: {duration}ms | Rotation: {rotationSpeed.toFixed(2)}x | Transform ease-in: {insideEaseInPower.toFixed(2)} | Resize: linear | Container: {containerWidth}x{containerHeight}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: containerWidth,
              height: containerHeight,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              <BlackHoleWhirlpool key={animationKey} duration={duration} rotationSpeed={rotationSpeed} insideTransformEaseInPower={insideEaseInPower}>
                {displayText}
              </BlackHoleWhirlpool>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
