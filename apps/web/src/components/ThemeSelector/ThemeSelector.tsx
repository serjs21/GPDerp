"use client";

import { Moon, Mountain, Sun } from "lucide-react";
import type { ThemeName } from "@/config/userConfiguration";
import { Dropdown, Slider } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import { useState, type CSSProperties } from "react";
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
const MOON_ICON_COLOR = "var(--moon-highlight)";
const SUN_ICON_COLOR = "var(--sun-highlight)";
const MOUNTAIN_ICON_COLOR = "var(--mountain-highlight)";
const MOON_STROKE_COLOR = "var(--moon-stroke)";
const SUN_STROKE_COLOR = "var(--sun-stroke)";
const MOUNTAIN_STROKE_COLOR = "var(--mountain-stroke)";
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
  scaleValue?: number;
  onChange: (next: ThemeName) => void; // committed theme
  onPreviewChange?: (progress: number) => void; // smooth slider preview 0..100
  onScaleCommit?: (progress: number) => void; // exact 0..100 commit
  className?: string;
  ariaLabel?: string;
};

export const ThemeSelector = ({
  value,
  scaleValue,
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
  const effectiveProgress =
    hasManualPosition || scaleValue === undefined ? progress : Math.max(0, Math.min(100, 100 - scaleValue));
  const themeScaleProgress = toThemeScaleProgress(effectiveProgress);
  const themeVars = getThemeScaleVars(themeScaleProgress);

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

  const moonFadeProgress = phaseBetween(effectiveProgress, MOON_FADE_START, MOON_HIDE_AT);
  const moonPhase = 1 - moonFadeProgress;
  const mountainVisible = effectiveProgress >= MOUNTAIN_VISIBLE_FROM && effectiveProgress <= MOUNTAIN_VISIBLE_TO;
  const sunPhase = phaseBetween(effectiveProgress, SUN_APPEAR_AT, SUN_MAX_SCALE_AT);
  const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
  const lerp = (from: number, to: number, t: number) => from + (to - from) * clamp01(t);
  const easeInOut = (t: number) => {
    const x = clamp01(t);
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  };
  const iconTransform = (x: number, y: number, scale: number) =>
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;

  const moonEdgeCenter = easeInOut(clamp01(1 - effectiveProgress / EDGE_CENTER_WINDOW));
  const sunEdgeCenter = easeInOut(
    clamp01((effectiveProgress - (100 - EDGE_CENTER_WINDOW)) / EDGE_CENTER_WINDOW),
  );

  const moonX = lerp(-ICON_CORNER_OFFSET_PX, 0, moonEdgeCenter);
  const moonY = lerp(-ICON_CORNER_OFFSET_PX, 0, moonEdgeCenter);
  const sunX = lerp(ICON_CORNER_OFFSET_PX, 0, sunEdgeCenter);
  const sunY = lerp(-ICON_CORNER_OFFSET_PX, 0, sunEdgeCenter);

  const sunScale = 0.7 + sunPhase * 0.3;
  const moonScale = 0.66 + moonPhase * 0.34;
  const moonOpacity = 1 - phaseBetween(effectiveProgress, MOON_OPACITY_FADE_START, MOON_OPACITY_HIDE_AT);
  const sunOpacity = phaseBetween(effectiveProgress, SUN_OPACITY_SHOW_AT, SUN_OPACITY_FULL_AT);
  const colorInfluence = (anchor: number) => clamp01(1 - Math.abs(effectiveProgress - anchor) / 50);
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
          "--moon-highlight": "color-mix(in srgb, var(--shrine-accent-soft) 75%, var(--surface-glass-strong) 25%)",
          "--sun-highlight": "color-mix(in srgb, #ffd54a 78%, var(--surface-glass-strong) 22%)",
          "--mountain-highlight": "color-mix(in srgb, var(--accent-red) 70%, var(--surface-glass-strong) 30%)",
          "--moon-stroke": "color-mix(in srgb, var(--text-color) 40%, var(--surface-glass-strong) 60%)",
          "--sun-stroke": "color-mix(in srgb, var(--text-color) 75%, var(--background) 25%)",
          "--mountain-stroke": "color-mix(in srgb, var(--accent-red) 65%, var(--text-color) 35%)",
          "--slider-accent": themeVars["--accent-red"],
          "--slider-stop-1": getThemeScaleVars(0)["--gradientStart"],
          "--slider-stop-2": getThemeScaleVars(25)["--gradientStart"],
          "--slider-stop-3": getThemeScaleVars(50)["--accent-red"],
          "--slider-stop-4": getThemeScaleVars(75)["--gradientMid"],
          "--slider-stop-5": getThemeScaleVars(100)["--background"],
        } as CSSProperties
      }
    >
      <Dropdown
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={["click"]}
        placement="bottom"
        styles={{
          root: {
            "--slider-accent": themeVars["--accent-red"],
            "--moon-highlight": "color-mix(in srgb, var(--shrine-accent-soft) 75%, var(--surface-glass-strong) 25%)",
            "--sun-highlight": "color-mix(in srgb, #ffd54a 78%, var(--surface-glass-strong) 22%)",
            "--mountain-highlight": "color-mix(in srgb, var(--accent-red) 70%, var(--surface-glass-strong) 30%)",
            "--moon-stroke": "color-mix(in srgb, var(--text-color) 40%, var(--surface-glass-strong) 60%)",
            "--sun-stroke": "color-mix(in srgb, var(--text-color) 75%, var(--background) 25%)",
            "--mountain-stroke": "color-mix(in srgb, var(--accent-red) 65%, var(--text-color) 35%)",
            "--slider-stop-1": getThemeScaleVars(0)["--gradientStart"],
            "--slider-stop-2": getThemeScaleVars(25)["--gradientStart"],
            "--slider-stop-3": getThemeScaleVars(50)["--accent-red"],
            "--slider-stop-4": getThemeScaleVars(75)["--gradientMid"],
            "--slider-stop-5": getThemeScaleVars(100)["--background"],
          } as CSSProperties,
        }}
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
                value={effectiveProgress}
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
          aria-label={`${ariaLabel}, ${Math.round(effectiveProgress)}%`}
          style={
            {
              "--icon-button-padding": `${ICON_BUTTON_PADDING_PX}px`,
            } as CSSProperties
          }
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
