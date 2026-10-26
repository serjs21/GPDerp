import {
  PASSWORD_CLAP_MAX_TILT_DEG,
  PASSWORD_CLAP_SIZE_REM,
  PASSWORD_TOGGLE_SIZE_REM,
} from "../consts/comicPasswordInputConsts";
import { pickPasswordClapPlacement } from "./comicPasswordInputUtils";

describe("pickPasswordClapPlacement", () => {
  it.each([0, 0.25, 0.5, 0.999])("stays left of the icon on its centre line, tilting 0..-max (random %p)", (value) => {
    const { cx, cy, deg } = pickPasswordClapPlacement(() => value);
    expect(cx + PASSWORD_CLAP_SIZE_REM / 2).toBeLessThan(0);
    expect(cy).toBe(PASSWORD_TOGGLE_SIZE_REM / 2);
    expect(deg).toBeLessThanOrEqual(0);
    expect(deg).toBeGreaterThanOrEqual(-PASSWORD_CLAP_MAX_TILT_DEG);
  });
});
