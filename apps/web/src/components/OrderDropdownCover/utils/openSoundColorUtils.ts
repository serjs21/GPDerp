import {
  OPEN_SOUND_LIGHTNESS,
  OPEN_SOUND_SATURATION,
} from "../consts/orderDropdownCoverConsts";

const BLACK_FILL = /\bfill="#000(?:000)?"/gi;

export function pickOpenSoundColor(random: () => number = Math.random): string {
  const hue = Math.floor(random() * 360);
  return `hsl(${hue}, ${OPEN_SOUND_SATURATION}%, ${OPEN_SOUND_LIGHTNESS}%)`;
}

/** Data URL of the sound effect with its black marks painted `color`; white scratch gaps stay white. */
export function buildColoredOpenSoundSrc(svgText: string, color: string): string {
  const colored = svgText.replace(BLACK_FILL, `fill="${color}"`);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(colored)}`;
}
