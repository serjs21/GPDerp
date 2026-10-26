import type { CSSProperties } from "react";
import {
  PASSWORD_CLAP_FADE_MS,
  PASSWORD_CLAP_GAP_REM,
  PASSWORD_CLAP_HOLD_MS,
  PASSWORD_CLAP_JITTER_Y_REM,
  PASSWORD_CLAP_LIGHTNESS,
  PASSWORD_CLAP_MAX_TILT_DEG,
  PASSWORD_CLAP_MIN_SPACING_REM,
  PASSWORD_CLAP_NEAR_REM,
  PASSWORD_CLAP_PLACEMENT_ATTEMPTS,
  PASSWORD_CLAP_SATURATION,
  PASSWORD_CLAP_SIZE_REM,
  PASSWORD_TOGGLE_SIZE_REM,
} from "../consts/comicPasswordInputConsts";
import type { PasswordClapPlacement } from "../PasswordClapBursts.types";

export function pickPasswordClapColor(random: () => number = Math.random): string {
  const hue = Math.floor(random() * 360);
  return `hsl(${hue}, ${PASSWORD_CLAP_SATURATION}%, ${PASSWORD_CLAP_LIGHTNESS}%)`;
}

/**
 * Random spot centre-left of the toggle icon (toggle-box rem coordinates), slightly tilted,
 * at least PASSWORD_CLAP_MIN_SPACING_REM from every `existing` burst; null when none fits.
 */
export function pickPasswordClapPlacement(
  existing: PasswordClapPlacement[],
  random: () => number = Math.random,
): PasswordClapPlacement | null {
  const nearestCx = -(PASSWORD_CLAP_GAP_REM + PASSWORD_CLAP_SIZE_REM / 2);
  const iconCy = PASSWORD_TOGGLE_SIZE_REM / 2;
  for (let attempt = 0; attempt < PASSWORD_CLAP_PLACEMENT_ATTEMPTS; attempt += 1) {
    const cx = nearestCx - random() * PASSWORD_CLAP_NEAR_REM;
    const cy = iconCy + (random() * 2 - 1) * PASSWORD_CLAP_JITTER_Y_REM;
    const tooClose = existing.some(
      (other) => Math.hypot(other.cx - cx, other.cy - cy) < PASSWORD_CLAP_MIN_SPACING_REM,
    );
    if (tooClose) continue;
    return { cx, cy, deg: (random() * 2 - 1) * PASSWORD_CLAP_MAX_TILT_DEG };
  }
  return null;
}

export function buildPasswordClapStyle(placement: PasswordClapPlacement, color: string): CSSProperties {
  return {
    "--pw-clap-left": `${placement.cx - PASSWORD_CLAP_SIZE_REM / 2}rem`,
    "--pw-clap-top": `${placement.cy - PASSWORD_CLAP_SIZE_REM / 2}rem`,
    "--pw-clap-size": `${PASSWORD_CLAP_SIZE_REM}rem`,
    "--pw-clap-rotate": `${placement.deg}deg`,
    "--pw-clap-color": color,
    "--pw-clap-hold-ms": `${PASSWORD_CLAP_HOLD_MS}ms`,
    "--pw-clap-fade-ms": `${PASSWORD_CLAP_FADE_MS}ms`,
  } as CSSProperties;
}
