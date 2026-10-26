import type { CSSProperties } from "react";
import {
  PASSWORD_CLAP_BASE_TILT_DEG,
  PASSWORD_CLAP_FADE_MS,
  PASSWORD_CLAP_GAP_REM,
  PASSWORD_CLAP_HOLD_MS,
  PASSWORD_CLAP_LIGHTNESS,
  PASSWORD_CLAP_MAX_TILT_DEG,
  PASSWORD_CLAP_SATURATION,
  PASSWORD_CLAP_SIZE_REM,
  PASSWORD_TOGGLE_SIZE_REM,
} from "../consts/comicPasswordInputConsts";
import type { PasswordClapPlacement } from "../PasswordClapBurst.types";

export function pickPasswordClapColor(random: () => number = Math.random): string {
  const hue = Math.floor(random() * 360);
  return `hsl(${hue}, ${PASSWORD_CLAP_SATURATION}%, ${PASSWORD_CLAP_LIGHTNESS}%)`;
}

/**
 * Burst just left of the toggle icon on its centre line (toggle-box rem coordinates),
 * tilted counter-clockwise from PASSWORD_CLAP_BASE_TILT_DEG by a random amount up to PASSWORD_CLAP_MAX_TILT_DEG.
 */
export function pickPasswordClapPlacement(random: () => number = Math.random): PasswordClapPlacement {
  return {
    cx: -(PASSWORD_CLAP_GAP_REM + PASSWORD_CLAP_SIZE_REM / 2),
    cy: PASSWORD_TOGGLE_SIZE_REM / 2,
    deg: PASSWORD_CLAP_BASE_TILT_DEG - random() * PASSWORD_CLAP_MAX_TILT_DEG,
  };
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
