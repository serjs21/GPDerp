import type { SelectorBackgroundBodies } from "@/theme/celestialSelectorLayout";
import type { useCelestialScene } from "@/theme/useCelestialScene";

export type PostcardTheme = {
  scene: ReturnType<typeof useCelestialScene>;
  backgroundBodies: SelectorBackgroundBodies;
};

export function postcardThemeFromCelestial(celestial: PostcardTheme): PostcardTheme {
  return { scene: celestial.scene, backgroundBodies: celestial.backgroundBodies };
}
