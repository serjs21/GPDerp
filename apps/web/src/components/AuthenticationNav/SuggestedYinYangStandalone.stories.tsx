import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import { ThemeSelector } from "@/components/ThemeSelector/ThemeSelector";
import { SuggestedLineOnlyButton } from "../../../local/suggested-yinyang-standalone/SuggestedLineOnlyButton";
import { DaoLogin } from "../../../local/suggested-yinyang-standalone/DaoLogin";
import { SuggestedLiquidYinYangAuthToggle } from "../../../local/suggested-yinyang-standalone/SuggestedLiquidYinYangAuthToggle";
import { SuggestedLiquidYinYangAuthToggleAnime } from "../../../local/suggested-yinyang-standalone/SuggestedLiquidYinYangAuthToggleAnime";
import { SuggestedLiquidYinYangAuthToggleAnimeWash } from "../../../local/suggested-yinyang-standalone/SuggestedLiquidYinYangAuthToggleAnimeWash";
import { SuggestedLiquidYinYangAuthToggleAnimeWhirlpool } from "../../../local/suggested-yinyang-standalone/SuggestedLiquidYinYangAuthToggleAnimeWhirlpool";
import { WashInSea, type WashDirection } from "../../../local/suggested-yinyang-standalone/wash-in-sea/WashInSea";
import { BlackHoleWhirlpool } from "../../../local/suggested-yinyang-standalone/wash-in-sea/BlackHoleWhirlpool";

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

export const LiquidYinYangToggleAnimeWaves: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const [fxKey, setFxKey] = useState(0);
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
          <SuggestedLiquidYinYangAuthToggleAnime />
          <button
            type="button"
            onPointerEnter={() => setFxKey((v) => v + 1)}
            onClick={() => setFxKey((v) => v + 1)}
            style={{
              width: 320,
              height: 44,
              borderRadius: 999,
              border: "1px solid color-mix(in srgb, var(--text-color) 14%, transparent)",
              background:
                "linear-gradient(90deg, color-mix(in srgb, var(--surface-glass-strong) 88%, var(--background) 12%) 0%, var(--accent-red) 100%)",
              color: "var(--text-color)",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              overflow: "hidden",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BlackHoleWhirlpool key={`bh-${fxKey}`} duration={5700}>
              <WashInSea key={`ws-${fxKey}`} direction="right" duration={5700}>
                Login
              </WashInSea>
            </BlackHoleWhirlpool>
          </button>
        </div>
      </div>
    );
  },
};

export const LiquidYinYangToggleAnimeWashHover: Story = {
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
          <SuggestedLiquidYinYangAuthToggleAnime />
          <SuggestedLiquidYinYangAuthToggleAnimeWash />
        </div>
      </div>
    );
  },
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
          <SuggestedLiquidYinYangAuthToggleAnime />
          <SuggestedLiquidYinYangAuthToggleAnimeWhirlpool />
        </div>
      </div>
    );
  },
};

export const WashInSeaAnimation: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const [direction, setDirection] = useState<WashDirection>("right");
    const [duration, setDuration] = useState(1900);
    const [playKey, setPlayKey] = useState(0);
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
        <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setDirection("left")}>
            Left
          </button>
          <button type="button" onClick={() => setDirection("right")}>
            Right
          </button>
          <button type="button" onClick={() => setDirection("up")}>
            Up
          </button>
          <button type="button" onClick={() => setDirection("down")}>
            Down
          </button>
          <button type="button" onClick={() => setDuration((current) => Math.max(500, current - 300))}>
            Faster
          </button>
          <button type="button" onClick={() => setDuration((current) => current + 300)}>
            Slower
          </button>
          <button type="button" onClick={() => setPlayKey((v) => v + 1)}>
            Replay
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 14, marginBottom: 8 }}>
          Direction: {direction} | Duration: {duration}ms
        </div>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
          <WashInSea key={playKey} direction={direction} duration={duration}>
            Login Register — carried by sea
          </WashInSea>
        </div>
      </div>
    );
  },
};

export const BlackHoleWhirlpoolAnimation: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeName>("tokyo-dusk");
    const [preview, setPreview] = useState<number | null>(null);
    const [duration, setDuration] = useState(1900);
    const [rotationSpeed, setRotationSpeed] = useState(1);
    const [insideEaseInPower, setInsideEaseInPower] = useState(2);
    const [displayText, setDisplayText] = useState("Login Register - pulled into black hole");
    const [containerWidth, setContainerWidth] = useState(520);
    const [containerHeight, setContainerHeight] = useState(120);
    const [playKey, setPlayKey] = useState(0);
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
        <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setDuration((current) => Math.max(500, current - 300))}>
            Faster
          </button>
          <button type="button" onClick={() => setDuration((current) => current + 300)}>
            Slower
          </button>
          <button type="button" onClick={() => setRotationSpeed((current) => Math.max(0.2, Number((current - 0.2).toFixed(2))))}>
            Rotation -
          </button>
          <button type="button" onClick={() => setRotationSpeed((current) => Math.min(4, Number((current + 0.2).toFixed(2))))}>
            Rotation +
          </button>
          <button type="button" onClick={() => setInsideEaseInPower((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}>
            Transform Ease -
          </button>
          <button type="button" onClick={() => setInsideEaseInPower((current) => Math.min(5, Number((current + 0.25).toFixed(2))))}>
            Transform Ease +
          </button>
          <button type="button" onClick={() => setContainerWidth((current) => Math.max(180, current - 20))}>
            Width -
          </button>
          <button type="button" onClick={() => setContainerWidth((current) => current + 20)}>
            Width +
          </button>
          <button type="button" onClick={() => setContainerHeight((current) => Math.max(44, current - 10))}>
            Height -
          </button>
          <button type="button" onClick={() => setContainerHeight((current) => current + 10)}>
            Height +
          </button>
          <button type="button" onClick={() => setPlayKey((v) => v + 1)}>
            Replay
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <input
            type="text"
            value={displayText}
            onChange={(event) => setDisplayText(event.target.value)}
            placeholder="Text to animate"
            style={{
              width: "min(680px, 92vw)",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid color-mix(in srgb, var(--text-color) 20%, transparent)",
              background: "var(--surface-glass-strong)",
              color: "var(--text-color)",
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
              <BlackHoleWhirlpool key={playKey} duration={duration} rotationSpeed={rotationSpeed} insideTransformEaseInPower={insideEaseInPower}>
                {displayText}
              </BlackHoleWhirlpool>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

