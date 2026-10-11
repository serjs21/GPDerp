import type { CSSProperties } from "react";
import type { RestartLinkReason } from "../RestartLinkButton.types";

function reviveBannerStyle(x: number, y: number, rotate: number): CSSProperties {
  return {
    "--revive-banner-x": `${String(x)}%`,
    "--revive-banner-y": `${String(y)}%`,
    "--revive-banner-rotate": `${String(rotate)}deg`,
  } as CSSProperties;
}

/** Revive-banner position vars; only the expired variant shows the banner. */
export function restartLinkRootStyle(
  reason: RestartLinkReason,
  banner: { x: number; y: number; rotate: number },
): CSSProperties | undefined {
  return reason === "expired" ? reviveBannerStyle(banner.x, banner.y, banner.rotate) : undefined;
}

export function displayChar(ch: string) {
  return ch === " " ? "\u00a0" : ch;
}
