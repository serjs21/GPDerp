const BLACK = "#000000";
const WHITE = "#ffffff";

const HEX_BLACK_WHITE = /#(?:000000|ffffff|000|fff)\b/gi;
const NAMED_BLACK_WHITE = /\b(fill|stroke|stop-color|color)(\s*[:=]\s*["']?)(black|white)\b/gi;
const ROOT_SVG_TAG = /<svg\b[^>]*>/i;

function swapColor(color: string): string {
  const value = color.toLowerCase();
  return value === "#000" || value === "#000000" || value === "black" ? WHITE : BLACK;
}

/**
 * Swap pure black and pure white in SVG markup; every other color stays as authored.
 * Shapes with no fill default to black, so the root gets a white fill when it has none.
 */
export function invertBlackWhiteSvg(svgText: string): string {
  const swapped = svgText
    .replace(HEX_BLACK_WHITE, swapColor)
    .replace(NAMED_BLACK_WHITE, (_, prop: string, sep: string, color: string) =>
      `${prop}${sep}${swapColor(color)}`,
    );
  return swapped.replace(ROOT_SVG_TAG, (tag) =>
    /\sfill\s*=/i.test(tag) ? tag : tag.replace(/^<svg\b/i, `<svg fill="${WHITE}"`),
  );
}

export function svgDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}
