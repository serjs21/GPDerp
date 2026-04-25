"use client";

import { Moon, Mountain, Sun } from "lucide-react";
import type { ThemeName } from "@/config/userConfiguration";
import { Dropdown, Slider } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import { useEffect, useState, type CSSProperties } from "react";
import { getThemeScaleVars } from "@/theme/themeScale";
import styles from "./ThemeSelector.module.css";

const THEME_PROGRESS: Record<ThemeName, number> = {
  "night-sky": 0,
  "tokyo-dusk": 50,
  sumie: 100,
};

const SAVABLE_THEME_POINTS: Array<{ theme: ThemeName; progress: number }> = [
  { theme: "night-sky", progress: 0 },
  { theme: "tokyo-dusk", progress: 50 },
  { theme: "sumie", progress: 100 },
];
const MAX_ICON_OVERLAP_PX = 4;
const ICON_BUTTON_PADDING_PX = 4;
const ICON_SIZE_PX = 16;
const ICON_CORNER_OFFSET_PX = (ICON_SIZE_PX - MAX_ICON_OVERLAP_PX) / Math.SQRT2;
const MOON_ICON_COLOR = "#9a89cd";
const SUN_ICON_COLOR = "#ecb173";
const MOUNTAIN_ICON_COLOR = "#b6bcc8";
const MOON_STROKE_COLOR = "#e7eaf1";
const SUN_STROKE_COLOR = "#252422";
const MOUNTAIN_STROKE_COLOR = "#2f2a2a";
const MOON_FADE_START = 20;
const MOON_HIDE_AT = 45;
const SUN_APPEAR_AT = 55;
const SUN_MAX_SCALE_AT = 80;
const MOON_OPACITY_FADE_START = 20;
const MOON_OPACITY_HIDE_AT = 45;
const SUN_OPACITY_SHOW_AT = 55;
const SUN_OPACITY_FULL_AT = 80;
const MOUNTAIN_VISIBLE_FROM = 15;
const MOUNTAIN_VISIBLE_TO = 85;
const EDGE_CENTER_WINDOW = 20;

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((ch) => `${ch}${ch}`).join("") : normalized;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const mixHex = (from: string, to: string, ratio: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const t = Math.min(1, Math.max(0, ratio));
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bVal = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bVal})`;
};

const accentForProgress = (progress: number) => {
  if (progress <= 75) {
    return mixHex("#e08d3c", "#d74844", progress / 75);
  }
  return mixHex("#d74844", "#7764b2", (progress - 75) / 25);
};

export const getNearestThemeByProgress = (progress: number): ThemeName => {
  const nearest = SAVABLE_THEME_POINTS.reduce((best, current) => {
    const bestDistance = Math.abs(progress - best.progress);
    const currentDistance = Math.abs(progress - current.progress);
    return currentDistance < bestDistance ? current : best;
  });
  return nearest.theme;
};

type ThemeSelectorProps = {
  value: ThemeName;
  onChange: (next: ThemeName) => void; // committed theme
  onPreviewChange?: (progress: number) => void; // smooth slider preview 0..100
  onScaleCommit?: (progress: number) => void; // exact 0..100 commit
  className?: string;
  ariaLabel?: string;
};

export const ThemeSelector = ({
  value,
  onChange,
  onPreviewChange,
  onScaleCommit,
  className,
  ariaLabel = "Theme",
}: ThemeSelectorProps) => {
  const [progress, setProgress] = useState(THEME_PROGRESS[value]);
  const [interacting, setInteracting] = useState(false);
  const [hasManualPosition, setHasManualPosition] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toThemeScaleProgress = (uiProgress: number) => 100 - uiProgress;
  const themeScaleProgress = toThemeScaleProgress(progress);
  const themeVars = getThemeScaleVars(themeScaleProgress);

  useEffect(() => {
    if (interacting || hasManualPosition) return;
    setProgress(THEME_PROGRESS[value]);
  }, [hasManualPosition, interacting, value]);

  const commitTheme = (nextProgress: number) => {
    const themeProgress = toThemeScaleProgress(nextProgress);
    if (onScaleCommit) {
      onScaleCommit(themeProgress);
      return;
    }
    onChange(getNearestThemeByProgress(nextProgress));
  };

  const phaseBetween = (value: number, start: number, end: number) => {
    if (value <= start) return 0;
    if (value >= end) return 1;
    return (value - start) / (end - start);
  };

  const moonFadeProgress = phaseBetween(progress, MOON_FADE_START, MOON_HIDE_AT);
  const moonPhase = 1 - moonFadeProgress;
  const mountainVisible = progress >= MOUNTAIN_VISIBLE_FROM && progress <= MOUNTAIN_VISIBLE_TO;
  const sunPhase = phaseBetween(progress, SUN_APPEAR_AT, SUN_MAX_SCALE_AT);
  const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
  const lerp = (from: number, to: number, t: number) => from + (to - from) * clamp01(t);
  const easeInOut = (t: number) => {
    const x = clamp01(t);
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  };
  const iconTransform = (x: number, y: number, scale: number) =>
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;

  const moonEdgeCenter = easeInOut(clamp01(1 - progress / EDGE_CENTER_WINDOW));
  const sunEdgeCenter = easeInOut(
    clamp01((progress - (100 - EDGE_CENTER_WINDOW)) / EDGE_CENTER_WINDOW),
  );

  const moonX = lerp(-ICON_CORNER_OFFSET_PX, 0, moonEdgeCenter);
  const moonY = lerp(-ICON_CORNER_OFFSET_PX, 0, moonEdgeCenter);
  const sunX = lerp(ICON_CORNER_OFFSET_PX, 0, sunEdgeCenter);
  const sunY = lerp(-ICON_CORNER_OFFSET_PX, 0, sunEdgeCenter);

  const sunScale = 0.7 + sunPhase * 0.3;
  const moonScale = 0.66 + moonPhase * 0.34;
  const moonOpacity = 1 - phaseBetween(progress, MOON_OPACITY_FADE_START, MOON_OPACITY_HIDE_AT);
  const sunOpacity = phaseBetween(progress, SUN_OPACITY_SHOW_AT, SUN_OPACITY_FULL_AT);
  const colorInfluence = (anchor: number) => clamp01(1 - Math.abs(progress - anchor) / 50);
  const moonInfluence = colorInfluence(0);
  const mountainInfluence = colorInfluence(50);
  const sunInfluence = colorInfluence(100);
  const blendedIconColor = (targetColor: string, influence: number) =>
    `color-mix(in srgb, ${themeVars["--text-muted"]} ${Math.round((1 - influence) * 100)}%, ${targetColor} ${Math.round(influence * 100)}%)`;
  const blendedStrokeColor = (targetColor: string, influence: number) =>
    `color-mix(in srgb, ${themeVars["--text-color"]} ${Math.round((1 - influence) * 100)}%, ${targetColor} ${Math.round(influence * 100)}%)`;
  const selectPresetProgress = (nextProgress: number) => {
    setProgress(nextProgress);
    setHasManualPosition(true);
    setInteracting(false);
    onPreviewChange?.(toThemeScaleProgress(nextProgress));
    commitTheme(nextProgress);
  };

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ""}`}
      style={
        {
          "--slider-accent": accentForProgress(themeScaleProgress),
          "--moon-highlight": MOON_ICON_COLOR,
          "--sun-highlight": SUN_ICON_COLOR,
          "--mountain-highlight": MOUNTAIN_ICON_COLOR,
        } as CSSProperties
      }
    >
      <Dropdown
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={["click"]}
        placement="bottom"
        overlayStyle={
          {
            "--slider-accent": accentForProgress(themeScaleProgress),
            "--moon-highlight": MOON_ICON_COLOR,
            "--sun-highlight": SUN_ICON_COLOR,
            "--mountain-highlight": MOUNTAIN_ICON_COLOR,
          } as CSSProperties
        }
        popupRender={() => (
          <div className={styles.panel}>
            <div className={styles.panelIcons}>
              <button
                type="button"
                className={styles.panelIconButton}
                aria-label="Set dark theme"
                onClick={() => selectPresetProgress(0)}
                style={
                  {
                    color: blendedIconColor(MOON_ICON_COLOR, moonInfluence),
                    "--icon-stroke": blendedStrokeColor(MOON_STROKE_COLOR, moonInfluence),
                  } as CSSProperties
                }
              >
                <Moon className={styles.icon} />
              </button>
              <button
                type="button"
                className={styles.panelIconButton}
                aria-label="Set balanced theme"
                onClick={() => selectPresetProgress(50)}
                style={
                  {
                    color: blendedIconColor(MOUNTAIN_ICON_COLOR, mountainInfluence),
                    "--icon-stroke": blendedStrokeColor(MOUNTAIN_STROKE_COLOR, mountainInfluence),
                  } as CSSProperties
                }
              >
                <Mountain className={styles.icon} />
              </button>
              <button
                type="button"
                className={styles.panelIconButton}
                aria-label="Set bright theme"
                onClick={() => selectPresetProgress(100)}
                style={
                  {
                    color: blendedIconColor(SUN_ICON_COLOR, sunInfluence),
                    "--icon-stroke": blendedStrokeColor(SUN_STROKE_COLOR, sunInfluence),
                  } as CSSProperties
                }
              >
                <Sun className={styles.icon} />
              </button>
            </div>
            <div className={styles.sliderWrap}>
              <div className={styles.rail} aria-hidden />
              <div className={styles.breakpoints} aria-hidden>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={progress}
                dots={false}
                tooltip={{ open: false }}
                onChange={(value) => {
                  if (typeof value !== "number") return;
                  if (!interacting) setInteracting(true);
                  if (!hasManualPosition) setHasManualPosition(true);
                  setProgress(value);
                  onPreviewChange?.(toThemeScaleProgress(value));
                }}
                onChangeComplete={(value) => {
                  if (typeof value !== "number") return;
                  setInteracting(false);
                  commitTheme(value);
                }}
                className={styles.slider}
                aria-label={ariaLabel}
              />
            </div>
          </div>
        )}
      >
        <UIButton
          className={styles.trigger}
          aria-label={ariaLabel}
          title={`${Math.round(progress)}%`}
          style={{
            "--icon-button-padding": `${ICON_BUTTON_PADDING_PX}px`,
            background: "color-mix(in srgb, var(--background) 88%, #fff 12%)",
            color: themeVars["--text-color"],
          } as CSSProperties}
        >
          <span className={styles.iconStack} aria-hidden>
            <Moon
              className={`${styles.icon} ${styles.moonIcon}`}
              style={{
                opacity: moonOpacity,
                transform: iconTransform(
                  moonX,
                  moonY,
                  moonScale,
                ),
                fill: MOON_ICON_COLOR,
              }}
            />
            <Mountain
              className={`${styles.icon} ${styles.mountainIcon}`}
              style={{
                opacity: mountainVisible ? 1 : 0,
                transform: iconTransform(0, 0, 1),
                fill: MOUNTAIN_ICON_COLOR,
              }}
            />
            <Sun
              className={`${styles.icon} ${styles.sunIcon}`}
              style={{
                opacity: sunOpacity,
                transform: iconTransform(
                  sunX,
                  sunY,
                  sunScale,
                ),
                fill: SUN_ICON_COLOR,
              }}
            />
          </span>
        </UIButton>
      </Dropdown>
    </div>
  );
};
