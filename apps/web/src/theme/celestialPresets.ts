import * as SunCalc from "suncalc";
import { CELESTIAL_FIXED_DATE } from "./celestialTime";
import type { GeoCoordinates } from "./celestialTheme";

export type CelestialPresetName =
  | "preDawn"
  | "sunrise"
  | "day"
  | "goldenHour"
  | "sunset"
  | "blueNight"
  | "deepNight";

export const CELESTIAL_REFERENCE_DAY = CELESTIAL_FIXED_DATE;

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

function referenceDateAtUtcHour(hour: number, minute = 0): Date {
  return new Date(
    `${CELESTIAL_REFERENCE_DAY}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+07:00`,
  );
}

function getSolarTimes(referenceDay: string, coordinates: GeoCoordinates) {
  const anchor = new Date(`${referenceDay}T12:00:00+07:00`);
  return SunCalc.getTimes(anchor, coordinates.latitude, coordinates.longitude);
}

const PRESET_FALLBACK: Record<CelestialPresetName, () => Date> = {
  preDawn: () => referenceDateAtUtcHour(5),
  sunrise: () => referenceDateAtUtcHour(6),
  day: () => referenceDateAtUtcHour(12),
  goldenHour: () => referenceDateAtUtcHour(17, 30),
  sunset: () => referenceDateAtUtcHour(18, 30),
  blueNight: () => referenceDateAtUtcHour(19, 30),
  deepNight: () => referenceDateAtUtcHour(0),
};

const PRESET_TIME_GETTER: Record<
  CelestialPresetName,
  (times: ReturnType<typeof SunCalc.getTimes>) => Date | undefined
> = {
  preDawn: (times) =>
    times.nightEnd ? new Date(times.nightEnd.getTime() - THIRTY_MINUTES_MS) : undefined,
  sunrise: (times) => times.sunrise ?? undefined,
  day: (times) => times.solarNoon ?? undefined,
  goldenHour: (times) => times.goldenHour ?? undefined,
  sunset: (times) => times.sunset ?? undefined,
  blueNight: (times) => times.nauticalDusk ?? undefined,
  deepNight: () => referenceDateAtUtcHour(0),
};

export function getCelestialPresetDate(
  preset: CelestialPresetName,
  coordinates: GeoCoordinates,
  referenceDay = CELESTIAL_REFERENCE_DAY,
): Date {
  const times = getSolarTimes(referenceDay, coordinates);
  return PRESET_TIME_GETTER[preset](times) ?? PRESET_FALLBACK[preset]();
}

export const CELESTIAL_PRESET_LABELS: Record<CelestialPresetName, string> = {
  preDawn: "Pre-dawn",
  sunrise: "Sunrise",
  day: "Day",
  goldenHour: "Golden hour",
  sunset: "Sunset",
  blueNight: "Blue night",
  deepNight: "Deep night",
};
