"use client";

import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { BackgroundScene } from "./BackgroundScene";
import { useBackgroundSceneThemeBalance } from "./useBackgroundSceneThemeBalance";

export function BackgroundSceneCelestial() {
  const { scene, backgroundBodies } = useCelestialTheme();
  const { global, mountain } = useBackgroundSceneThemeBalance();

  return (
    <BackgroundScene
      theme={scene.theme}
      backgroundBodies={backgroundBodies}
      colorBalance={global}
      mountainColorBalance={mountain}
    />
  );
}
