export type SelectorButtonMode = "day" | "night";

export type ButtonBodyPlacement = {
  left: string;
  top: string;
  width: string;
  zIndex: number;
  opacity: number;
};

export type SelectorButtonStackConfig = {
  earth: ButtonBodyPlacement;
  sun: ButtonBodyPlacement;
  moon: ButtonBodyPlacement;
};

/** Night: moon zoomed in front of earth; sun at orbit size behind earth. */
export const CELESTIAL_SELECTOR_BUTTON_NIGHT: SelectorButtonStackConfig = {
  earth: {
    left: "50%",
    top: "50%",
    width: "36%",
    zIndex: 2,
    opacity: 1,
  },
  moon: {
    left: "56%",
    top: "42%",
    width: "28%",
    zIndex: 3,
    opacity: 1,
  },
  sun: {
    left: "44%",
    top: "58%",
    width: "20%",
    zIndex: 1,
    opacity: 0.92,
  },
};

/** Day: sun zoomed in front of earth; moon small and dim behind earth. */
export const CELESTIAL_SELECTOR_BUTTON_DAY: SelectorButtonStackConfig = {
  earth: {
    left: "50%",
    top: "50%",
    width: "36%",
    zIndex: 2,
    opacity: 1,
  },
  sun: {
    left: "54%",
    top: "44%",
    width: "28%",
    zIndex: 3,
    opacity: 1,
  },
  moon: {
    left: "46%",
    top: "58%",
    width: "10%",
    zIndex: 1,
    opacity: 0.35,
  },
};

export function selectorButtonPresentationFromMode(
  mode: SelectorButtonMode,
): "buttonDay" | "buttonNight" {
  return mode === "day" ? "buttonDay" : "buttonNight";
}

export function selectorButtonStackFromPresentation(
  presentation: "buttonDay" | "buttonNight",
): SelectorButtonStackConfig {
  return presentation === "buttonNight"
    ? CELESTIAL_SELECTOR_BUTTON_NIGHT
    : CELESTIAL_SELECTOR_BUTTON_DAY;
}

/** Orbit mode: scale button-stack offsets from earth center (1 = closed button). */
export const CELESTIAL_SELECTOR_ORBIT_SPREAD_FACTOR = 2.1;

export function parseButtonPlacementPercent(value: string): number {
  return Number.parseFloat(value.replace("%", ""));
}

export function buttonPlacementOffsetFromCenter(placement: ButtonBodyPlacement) {
  return {
    dx: parseButtonPlacementPercent(placement.left) - 50,
    dy: parseButtonPlacementPercent(placement.top) - 50,
  };
}
