"use client";

import { Moon, Mountain, Sun } from "lucide-react";
import type { ThemeName } from "@/config/userConfiguration";
import { Dropdown, Slider } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import { useState, type CSSProperties } from "react";
import { getThemeScaleVars } from "@/theme/themeScale";
import {
  clamp01,
  getIconMotionState,
  themeScaleToUiProgress,
  uiProgressToThemeScale,
} from "@/theme/themeSkyMotion";
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

const ICON_BUTTON_PADDING_PX = 4;
const MOON_ICON_COLOR = "var(--moon-highlight)";
const SUN_ICON_COLOR = "var(--sun-highlight)";
const MOUNTAIN_ICON_COLOR = "var(--mountain-highlight)";
const MOON_STROKE_COLOR = "var(--moon-stroke)";
const SUN_STROKE_COLOR = "var(--sun-stroke)";
const MOUNTAIN_STROKE_COLOR = "var(--mountain-stroke)";

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
  onChange: (next: ThemeName) => void;
  onPreviewChange?: (progress: number) => void;
  onScaleCommit?: (progress: number) => void;
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
  const effectiveProgress =
    hasManualPosition || scaleValue === undefined ? progress : themeScaleToUiProgress(scaleValue);
  const themeScaleProgress = uiProgressToThemeScale(effectiveProgress);
  const themeVars = getThemeScaleVars(themeScaleProgress);
  const iconMotion = getIconMotionState(effectiveProgress);

  const commitTheme = (nextProgress: number) => {
    const themeProgress = uiProgressToThemeScale(nextProgress);
    if (onScaleCommit) {
      onScaleCommit(themeProgress);
      return;
    }
    onChange(getNearestThemeByProgress(nextProgress));
  };

  const iconTransform = (x: number, y: number, scale: number) =>
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;

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
    onPreviewChange?.(uiProgressToThemeScale(nextProgress));
    commitTheme(nextProgress);
  };

  const sliderStyle = {
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
  } as CSSProperties;

  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ""}`} style={sliderStyle}>
      <Dropdown
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={["click"]}
        placement="bottom"
        styles={{ root: sliderStyle }}
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
                  onPreviewChange?.(uiProgressToThemeScale(value));
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
          style={{ "--icon-button-padding": `${ICON_BUTTON_PADDING_PX}px` } as CSSProperties}
        >
          <span className={styles.iconStack} aria-hidden>
            <Moon
              className={`${styles.icon} ${styles.moonIcon}`}
              style={{
                opacity: iconMotion.moon.opacity,
                transform: iconTransform(iconMotion.moon.x, iconMotion.moon.y, iconMotion.moon.scale),
                fill: MOON_ICON_COLOR,
              }}
            />
            <Mountain
              className={`${styles.icon} ${styles.mountainIcon}`}
              style={{
                opacity: iconMotion.mountain.opacity,
                transform: iconTransform(0, 0, 1),
                fill: MOUNTAIN_ICON_COLOR,
              }}
            />
            <Sun
              className={`${styles.icon} ${styles.sunIcon}`}
              style={{
                opacity: iconMotion.sun.opacity,
                transform: iconTransform(iconMotion.sun.x, iconMotion.sun.y, iconMotion.sun.scale),
                fill: SUN_ICON_COLOR,
              }}
            />
          </span>
        </UIButton>
      </Dropdown>
    </div>
  );
};
