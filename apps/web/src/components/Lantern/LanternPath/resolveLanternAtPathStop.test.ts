import { LANTERN_EXIT_STOP_OPACITY } from "../path";
import {
  LANTERN_PATH_VIRTUAL_STOP,
  LANTERN_PATH_PUSH_OUT_X,
} from "./lanternPath.config";
import { resolveLanternAtPathStop } from "./resolveLanternAtPathStop";

describe("resolveLanternAtPathStop", () => {
  it("places virtual stop -1 off-screen with zero opacity", () => {
    const transform = resolveLanternAtPathStop(LANTERN_PATH_VIRTUAL_STOP);
    expect(transform.x).toBeCloseTo(LANTERN_PATH_PUSH_OUT_X, 5);
    expect(transform.opacity).toBe(0);
    expect(transform.rotate).toBe(0);
  });

  it("rests stop-0 at half opacity", () => {
    const transform = resolveLanternAtPathStop(0);
    expect(transform.opacity).toBeCloseTo(LANTERN_EXIT_STOP_OPACITY, 5);
  });

  it("keeps stop-1 at full opacity", () => {
    const transform = resolveLanternAtPathStop(1);
    expect(transform.opacity).toBe(1);
    expect(transform.scale).toBeGreaterThan(0);
  });

  it("lerps linearly between integer stops", () => {
    const mid = resolveLanternAtPathStop(0.5);
    const atZero = resolveLanternAtPathStop(0);
    const atOne = resolveLanternAtPathStop(1);
    expect(mid.x).toBeGreaterThan(Math.min(atZero.x, atOne.x));
    expect(mid.x).toBeLessThan(Math.max(atZero.x, atOne.x));
    expect(mid.opacity).toBe(1);
  });

  it("collapses scale at deep stop-16", () => {
    const transform = resolveLanternAtPathStop(16);
    expect(transform.scale).toBe(0);
  });

  it("stacks stop-1 above deeper stops", () => {
    const atFocus = resolveLanternAtPathStop(1);
    const atSecond = resolveLanternAtPathStop(2);
    const atThird = resolveLanternAtPathStop(3);
    expect(atFocus.stackOrder).toBeGreaterThan(atSecond.stackOrder ?? 0);
    expect(atSecond.stackOrder).toBeGreaterThan(atThird.stackOrder ?? 0);
  });

  it("stacks exit stop below focus", () => {
    const atFocus = resolveLanternAtPathStop(1);
    const atExit = resolveLanternAtPathStop(0);
    expect(atFocus.stackOrder).toBeGreaterThan(atExit.stackOrder ?? 0);
  });
});
