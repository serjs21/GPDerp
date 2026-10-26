import {
  PASSWORD_CLAP_MAX_COUNT,
  PASSWORD_CLAP_MAX_TILT_DEG,
  PASSWORD_CLAP_MIN_SPACING_REM,
  PASSWORD_CLAP_SIZE_REM,
  PASSWORD_TOGGLE_SIZE_REM,
} from "../consts/comicPasswordInputConsts";
import type { PasswordClapPlacement } from "../PasswordClapBursts.types";
import { pickPasswordClapPlacement } from "./comicPasswordInputUtils";

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("pickPasswordClapPlacement", () => {
  it.each(Array.from({ length: 50 }, (_, seed) => seed + 1))(
    "fits the max count of spaced, slightly tilted bursts left of the icon (seed %i)",
    (seed) => {
    const random = seededRandom(seed);
    const placed: PasswordClapPlacement[] = [];
    for (let i = 0; i < PASSWORD_CLAP_MAX_COUNT; i += 1) {
      const placement = pickPasswordClapPlacement(placed, random);
      if (placement) placed.push(placement);
    }
      expect(placed.length).toBeGreaterThanOrEqual(PASSWORD_CLAP_MAX_COUNT - 1);
    for (const { cx, cy, deg } of placed) {
      expect(cx + PASSWORD_CLAP_SIZE_REM / 2).toBeLessThan(0);
      expect(Math.abs(cy - PASSWORD_TOGGLE_SIZE_REM / 2)).toBeLessThanOrEqual(PASSWORD_TOGGLE_SIZE_REM / 2);
      expect(Math.abs(deg)).toBeLessThanOrEqual(PASSWORD_CLAP_MAX_TILT_DEG);
    }
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const distance = Math.hypot(placed[i].cx - placed[j].cx, placed[i].cy - placed[j].cy);
        expect(distance).toBeGreaterThanOrEqual(PASSWORD_CLAP_MIN_SPACING_REM);
      }
    }
    },
  );
});
