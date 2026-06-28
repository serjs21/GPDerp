import { useMemo } from "react";
import {
  getCelestialLayout,
  getSceneCssVariables,
  getThemeAt,
  STATIC_OVERLAY,
  type CelestialProjectionOptions,
  type GeoCoordinates,
} from "./celestialTheme";

export type CelestialSceneInput = {
  date: Date;
  coordinates: GeoCoordinates;
  projection?: CelestialProjectionOptions;
};

export const BANGKOK_COORDINATES: GeoCoordinates = {
  latitude: 13.7563,
  longitude: 100.5018,
};

export const DEFAULT_CELESTIAL_PROJECTION: CelestialProjectionOptions = {
  cameraAzimuthDeg: 180,
  mirrorScene: true,
  horizonY: 82,
  zenithY: 10,
  horizontalPadding: 5,
};

export function useCelestialScene(input: CelestialSceneInput) {
  const { date, coordinates, projection = DEFAULT_CELESTIAL_PROJECTION } = input;

  return useMemo(() => {
    const theme = getThemeAt(date, coordinates);
    const layout = getCelestialLayout(date, coordinates, projection);
    const sceneVars = getSceneCssVariables(theme, layout, STATIC_OVERLAY);

    return { theme, layout, sceneVars };
  }, [date, coordinates, projection]);
}
