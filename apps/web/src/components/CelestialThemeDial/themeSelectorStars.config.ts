export type ThemeSelectorStarPosition = {
  left: string;
  top: string;
};

/** Fixed dial-face positions — spread across the full circular controller background. */
export const THEME_SELECTOR_STAR_POSITIONS: readonly ThemeSelectorStarPosition[] = [
  { left: "22%", top: "14%" },
  { left: "50%", top: "10%" },
  { left: "78%", top: "16%" },
  { left: "12%", top: "38%" },
  { left: "38%", top: "32%" },
  { left: "68%", top: "40%" },
  { left: "88%", top: "52%" },
  { left: "18%", top: "58%" },
  { left: "52%", top: "54%" },
  { left: "76%", top: "66%" },
  { left: "30%", top: "78%" },
  { left: "58%", top: "84%" },
  { left: "82%", top: "80%" },
] as const;

/** Matches selector moon icon color and glow in ThemeSelectorIcon.module.css */
export const THEME_SELECTOR_STAR_APPEARANCE = {
  sizePx: 1,
  color: "#c4c1c1",
  glowColor: "red",
  glowMixPercent: 80,
  glowBlurRem: 1,
} as const;
