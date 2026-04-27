"use client";

export type AuthNavYinHovered = "login" | "register" | null;
export type AuthNavYinSegment = "login" | "register";

export const AUTH_NAV_YIN_VIEWBOX = "0 0 320 44";
export const AUTH_NAV_YIN_INITIAL_PATH = "M 160 0 Q 145 11 160 22 Q 175 33 160 44";
export const AUTH_NAV_YIN_HOVER_PATH = "M 0 22 L 320 22";

export const AUTH_NAV_YIN_HOVER_DUR_S = 0.55;
export const AUTH_NAV_YIN_HOVER_DUR_REDUCED_S = 0.12;

const LOGIN_REGION_IDLE =
  "M 22 0 H 160 Q 145 11 160 22 Q 175 33 160 44 H 22 A 22 22 0 0 1 0 22 A 22 22 0 0 1 22 0 Z";
const LOGIN_REGION_ABOVE = "M 22 0 H 298 A 22 22 0 0 1 320 22 L 0 22 L 0 22 A 22 22 0 0 1 22 0 Z";
const LOGIN_REGION_BELOW =
  "M 0 22 L 320 22 L 320 44 A 22 22 0 0 1 298 44 H 22 A 22 22 0 0 1 0 22 Z";

const REGISTER_REGION_IDLE =
  "M 160 0 H 298 A 22 22 0 0 1 320 22 A 22 22 0 0 1 298 44 H 160 Q 175 33 160 22 Q 145 11 160 0 Z";
const REGISTER_REGION_BELOW =
  "M 0 22 L 320 22 L 320 44 A 22 22 0 0 1 298 44 H 22 A 22 22 0 0 1 0 22 Z";
const REGISTER_REGION_ABOVE =
  "M 22 0 H 298 A 22 22 0 0 1 320 22 L 0 22 L 0 22 A 22 22 0 0 1 22 0 Z";

export const authNavYinEase = [0.33, 1, 0.68, 1] as const;
export const authNavYinFastFadeEase = "easeOut" as const;

export function authNavYinRegionPaths(hovered: AuthNavYinHovered) {
  if (hovered === "login") {
    return { loginRegionD: LOGIN_REGION_ABOVE, registerRegionD: REGISTER_REGION_BELOW };
  }
  if (hovered === "register") {
    return { loginRegionD: LOGIN_REGION_BELOW, registerRegionD: REGISTER_REGION_ABOVE };
  }
  return { loginRegionD: LOGIN_REGION_IDLE, registerRegionD: REGISTER_REGION_IDLE };
}

export function authNavYinPathTransition(reduceMotion: boolean, long: boolean) {
  return {
    type: "tween" as const,
    duration: reduceMotion ? AUTH_NAV_YIN_HOVER_DUR_REDUCED_S : long ? AUTH_NAV_YIN_HOVER_DUR_S : 0.2,
    ease: authNavYinEase,
  };
}

/** Flex weight: inactive column stays a thin hover strip. */
export function authNavYinSegmentFlex(hovered: AuthNavYinHovered, segment: AuthNavYinSegment) {
  if (hovered === null) return 1;
  return hovered === segment ? 1 : 0.045;
}

export function authNavYinHitOpacity(hovered: AuthNavYinHovered, segment: AuthNavYinSegment) {
  if (hovered === null) return 1;
  return hovered === segment ? 1 : 0;
}

