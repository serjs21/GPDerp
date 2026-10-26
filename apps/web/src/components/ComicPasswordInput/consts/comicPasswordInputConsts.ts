/** Toggle art for the current state of the field: masked vs. shown. */
export const PASSWORD_HIDDEN_ICON_SRC = "/password_input/password_hidden.svg";
export const PASSWORD_VISIBLE_ICON_SRC = "/password_input/password_visible.svg";

/** Clap burst size (rem); same as the lantern actions clap. The art itself is a CSS mask. */
export const PASSWORD_CLAP_SIZE_REM = 2.1;
/** Toggle button size (rem); matches `.toggle` in ComicPasswordInput.module.css. */
export const PASSWORD_TOGGLE_SIZE_REM = 2.25;
/** Clearance (rem) between the icon's left edge and the nearest burst edge. */
export const PASSWORD_CLAP_GAP_REM = 0.15;
/** Extra distance (rem) a burst may drift further left of the icon. */
export const PASSWORD_CLAP_NEAR_REM = 1.8;
/** Max vertical drift (rem) above or below the icon's centre line. */
export const PASSWORD_CLAP_JITTER_Y_REM = 0.6;
/** Max tilt either way, in degrees. */
export const PASSWORD_CLAP_MAX_TILT_DEG = 20;
/** Minimum distance (rem) between the centres of two visible bursts. */
export const PASSWORD_CLAP_MIN_SPACING_REM = 0.7;
export const PASSWORD_CLAP_MAX_COUNT = 3;
export const PASSWORD_CLAP_PLACEMENT_ATTEMPTS = 30;
/** Random hue per burst; saturation/lightness match the order-by sound effects. */
export const PASSWORD_CLAP_SATURATION = 85;
export const PASSWORD_CLAP_LIGHTNESS = 50;
export const PASSWORD_CLAP_HOLD_MS = 1000;
export const PASSWORD_CLAP_FADE_MS = 200;
