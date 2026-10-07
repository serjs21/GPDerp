/** Header nav icon height in px (4rem); CSS modules use `4rem` for the same size. */
export const HEADER_NAV_ICON_SIZE_PX = 64;

/** Marks the sticky app header (LayoutProviders + Storybook app layout). */
export const SITE_HEADER_SELECTOR = "[data-site-header]";

/**
 * 0–1 share of the header height overlapped by page content; set on
 * `<html>` by pages that opt in, read by the header background.
 */
export const SITE_HEADER_OVERLAP_VAR = "--site-header-overlap";
