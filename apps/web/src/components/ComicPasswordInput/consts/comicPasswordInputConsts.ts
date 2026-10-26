/** Toggle art for the current state of the field: masked vs. shown. */
export const PASSWORD_HIDDEN_ICON_SRC = "/password_input/password_hidden.svg";
export const PASSWORD_VISIBLE_ICON_SRC = "/password_input/password_visible.svg";

/** Clap burst size (rem); same as the lantern actions clap. The art itself is a CSS mask. */
export const PASSWORD_CLAP_SIZE_REM = 2.1;
/** Toggle button size (rem); matches `.toggle` in ComicPasswordInput.module.css. */
export const PASSWORD_TOGGLE_SIZE_REM = 2.25;
/** Clearance (rem) between the icon's left edge and the burst's right edge. */
export const PASSWORD_CLAP_GAP_REM = 0.15;
/** Resting tilt of the burst, in degrees (negative = counter-clockwise). */
export const PASSWORD_CLAP_BASE_TILT_DEG = -15;
/** Max extra counter-clockwise tilt from the resting tilt, in degrees. */
export const PASSWORD_CLAP_MAX_TILT_DEG = 30;
/** Random hue per burst; saturation/lightness match the order-by sound effects. */
export const PASSWORD_CLAP_SATURATION = 85;
export const PASSWORD_CLAP_LIGHTNESS = 50;
export const PASSWORD_CLAP_HOLD_MS = 1000;
export const PASSWORD_CLAP_FADE_MS = 200;
