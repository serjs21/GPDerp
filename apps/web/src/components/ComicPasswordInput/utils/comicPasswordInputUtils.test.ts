import {
  PASSWORD_CLAP_JITTER_Y_REM,
  PASSWORD_CLAP_MAX_TILT_DEG,
  PASSWORD_CLAP_SIZE_REM,
  PASSWORD_TOGGLE_SIZE_REM,
} from "../consts/comicPasswordInputConsts";
import { pickPasswordClapPlacement } from "./comicPasswordInputUtils";

describe("pickPasswordClapPlacement", () => {
  it.each([0, 0.25, 0.5, 0.999])("keeps x fixed left of the icon and tilts 0..-max (random %p)", (value) => {
    const { cx, cy, deg } = pickPasswordClapPlacement(() => value);
    const fixed = pickPasswordClapPlacement(() => 0);
    expect(cx).toBe(fixed.cx);
    expect(cx + PASSWORD_CLAP_SIZE_REM / 2).toBeLessThan(0);
    expect(Math.abs(cy - PASSWORD_TOGGLE_SIZE_REM / 2)).toBeLessThanOrEqual(PASSWORD_CLAP_JITTER_Y_REM);
    expect(deg).toBeLessThanOrEqual(0);
    expect(deg).toBeGreaterThanOrEqual(-PASSWORD_CLAP_MAX_TILT_DEG);
  });
});
