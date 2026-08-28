import {
  LANTERN_FLIGHT_EXIT_MS,
  LANTERN_FLIGHT_STEP_MS,
  flightPoseAtCall,
  flightStepDelta,
  initialFlightCssVars,
  lanternFlightStepCount,
  runSteppedLanternFlight,
  simulateFlight,
} from "./simulateFlight";

describe("simulateFlight", () => {
  it("exports exit duration constant", () => {
    expect(LANTERN_FLIGHT_EXIT_MS).toBe(4000);
  });

  it("exports step constant matching LANTERN_FLIGHT_STEP_MS", () => {
    expect(LANTERN_FLIGHT_STEP_MS).toBe(500);
  });

  it("scales step delta down by callIndex", () => {
    const random = () => 0;
    const first = flightStepDelta({ random, callIndex: 1 });
    const second = flightStepDelta({ random, callIndex: 2 });
    expect(Math.abs(first.x)).toBeGreaterThan(0);
    expect(Math.abs(second.x)).toBeCloseTo(Math.abs(first.x) / 2, 0);
    expect(Math.abs(second.y)).toBeCloseTo(Math.abs(first.y) / 2, 0);
  });

  it("accumulates flight offset across calls", () => {
    const random = () => 0;
    const totalCalls = lanternFlightStepCount();
    let accumulated = { x: 0, y: 0 };

    const first = simulateFlight({ positionMode: "percent" }, accumulated, {
      random,
      callIndex: 1,
      totalCalls,
    }) as Record<string, string>;
    const delta = flightStepDelta({ random, callIndex: 1 });
    accumulated = { x: accumulated.x + delta.x, y: accumulated.y + delta.y };

    const second = simulateFlight({ positionMode: "percent" }, accumulated, {
      random,
      callIndex: 2,
      totalCalls,
    }) as Record<string, string>;

    const firstY = Number.parseFloat(first["--lantern-flight-y"]);
    const secondY = Number.parseFloat(second["--lantern-flight-y"]);
    expect(firstY).toBeLessThanOrEqual(0);
    expect(secondY).toBeLessThan(firstY);
  });

  it("eases scale and opacity down using path scroll pose curve", () => {
    const totalCalls = lanternFlightStepCount();
    const firstPose = flightPoseAtCall(1, totalCalls);
    const lastPose = flightPoseAtCall(totalCalls, totalCalls);

    expect(firstPose.scale).toBeCloseTo(1, 1);
    expect(firstPose.opacity).toBe(1);
    expect(lastPose.scale).toBeLessThan(0.01);
    expect(lastPose.opacity).toBe(0);

    const first = simulateFlight({ positionMode: "percent", scale: 1 }, { x: 0, y: 0 }, {
      callIndex: 1,
      totalCalls,
    }) as Record<string, string>;
    const last = simulateFlight({ positionMode: "percent", scale: 1 }, { x: 0, y: 0 }, {
      callIndex: totalCalls,
      totalCalls,
    }) as Record<string, string>;

    expect(Number.parseFloat(first["--lantern-scale"])).toBeCloseTo(1, 1);
    expect(Number.parseFloat(last["--lantern-scale"])).toBeLessThan(0.01);
    expect(Number.parseFloat(first["--lantern-opacity"])).toBe(1);
    expect(Number.parseFloat(last["--lantern-opacity"])).toBe(0);
  });

  it("never flies downward for path-positioned lanterns", () => {
    const totalCalls = lanternFlightStepCount();
    for (let seed = 0; seed < 50; seed += 1) {
      const random = () => {
        const x = Math.sin(seed + 1) * 10000;
        return x - Math.floor(x);
      };
      let accumulated = { x: 0, y: 0 };
      let previousY = 0;

      for (let callIndex = 1; callIndex <= totalCalls; callIndex += 1) {
        const delta = flightStepDelta({ random, callIndex });
        accumulated = { x: accumulated.x + delta.x, y: accumulated.y + delta.y };
        const vars = simulateFlight({ positionMode: "percent" }, accumulated, {
          random,
          callIndex,
          totalCalls,
        }) as Record<string, string>;
        const flightY = Number.parseFloat(vars["--lantern-flight-y"]);
        expect(flightY).toBeLessThanOrEqual(previousY);
        previousY = flightY;
      }
    }
  });

  it("never flies downward for translate-mode lanterns", () => {
    const totalCalls = lanternFlightStepCount();
    for (let seed = 0; seed < 50; seed += 1) {
      const random = () => {
        const x = Math.cos(seed + 2) * 10000;
        return x - Math.floor(x);
      };
      let accumulated = { x: 0, y: 0 };

      for (let callIndex = 1; callIndex <= totalCalls; callIndex += 1) {
        const delta = flightStepDelta({ random, callIndex });
        accumulated = { x: accumulated.x + delta.x, y: accumulated.y + delta.y };
        const vars = simulateFlight(
          { positionMode: "translate", x: 0, y: 0, rotate: 12 },
          accumulated,
          { random, callIndex, totalCalls },
        ) as Record<string, string>;
        const endY = Number.parseFloat(vars["--lantern-y"]);
        expect(endY).toBeLessThanOrEqual(0);
        expect(vars["--lantern-rotate"]).toBe("12deg");
      }
    }
  });

  it("is reproducible with a seeded random and fixed accumulated offset", () => {
    const accumulated = { x: 40, y: -120 };
    const a = simulateFlight({ positionMode: "percent" }, accumulated, {
      callIndex: 3,
      totalCalls: 8,
    });
    const b = simulateFlight({ positionMode: "percent" }, accumulated, {
      callIndex: 3,
      totalCalls: 8,
    });
    expect(a).toEqual(b);
  });

  it("resets path flight vars to zero", () => {
    expect(initialFlightCssVars("percent")).toEqual({
      "--lantern-flight-x": "0px",
      "--lantern-flight-y": "0px",
    });
  });
});

describe("runSteppedLanternFlight", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls onStep each step interval and resolves at exit duration", async () => {
    const onStep = jest.fn();
    const { promise } = runSteppedLanternFlight({ positionMode: "percent" }, onStep);
    const stepCount = lanternFlightStepCount();

    expect(onStep).toHaveBeenCalledTimes(1);

    for (let step = 1; step < stepCount; step += 1) {
      jest.advanceTimersByTime(LANTERN_FLIGHT_STEP_MS);
      expect(onStep).toHaveBeenCalledTimes(step + 1);
    }

    jest.advanceTimersByTime(LANTERN_FLIGHT_EXIT_MS - (stepCount - 1) * LANTERN_FLIGHT_STEP_MS);
    await promise;
    expect(onStep).toHaveBeenCalledTimes(stepCount);
  });

  it("accumulates Y offset monotonically upward across steps", () => {
    const onStep = jest.fn();
    runSteppedLanternFlight({ positionMode: "percent" }, onStep);
    jest.advanceTimersByTime(LANTERN_FLIGHT_EXIT_MS);

    let previousY = 0;
    for (let call = 0; call < onStep.mock.calls.length; call += 1) {
      const style = onStep.mock.calls[call][0] as Record<string, string>;
      const flightY = Number.parseFloat(style["--lantern-flight-y"]);
      expect(flightY).toBeLessThanOrEqual(previousY);
      previousY = flightY;
    }
  });

  it("cancel stops pending steps", () => {
    const onStep = jest.fn();
    const { cancel } = runSteppedLanternFlight({ positionMode: "percent" }, onStep);

    expect(onStep).toHaveBeenCalledTimes(1);
    cancel();
    jest.advanceTimersByTime(LANTERN_FLIGHT_EXIT_MS);
    expect(onStep).toHaveBeenCalledTimes(1);
  });
});
