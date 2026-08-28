import {
  LANTERN_FLIGHT_EXIT_MS,
  LANTERN_FLIGHT_STEP_MS,
  initialFlightCssVars,
  runSteppedLanternFlight,
  simulateFlight,
} from "./simulateFlight";

describe("simulateFlight", () => {
  it("exports 2s duration constant", () => {
    expect(LANTERN_FLIGHT_EXIT_MS).toBe(2000);
  });

  it("exports step constant matching LANTERN_FLIGHT_STEP_MS", () => {
    expect(LANTERN_FLIGHT_STEP_MS).toBe(300);
  });

  it("scales distance down by callIndex", () => {
    const random = () => 0;
    const first = simulateFlight({ positionMode: "percent" }, { random, callIndex: 1 }) as Record<
      string,
      string
    >;
    const second = simulateFlight({ positionMode: "percent" }, { random, callIndex: 2 }) as Record<
      string,
      string
    >;
    const firstX = Math.abs(Number.parseFloat(first["--lantern-flight-x"]));
    const secondX = Math.abs(Number.parseFloat(second["--lantern-flight-x"]));
    expect(firstX).toBeGreaterThan(0);
    expect(secondX).toBeGreaterThan(0);
    expect(secondX).toBeCloseTo(firstX / 2, 0);
  });

  it("never flies downward for path-positioned lanterns", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const random = () => {
        const x = Math.sin(seed + 1) * 10000;
        return x - Math.floor(x);
      };
      const vars = simulateFlight({ positionMode: "percent" }, { random }) as Record<string, string>;
      const flightY = Number.parseFloat(vars["--lantern-flight-y"]);
      expect(flightY).toBeLessThanOrEqual(0);
      expect(vars["--lantern-opacity"]).toBe("0");
      expect(vars["--lantern-scale"]).toBe("0");
      expect(vars["--lantern-flight-rotate"]).toBeUndefined();
    }
  });

  it("never flies downward for translate-mode lanterns", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const random = () => {
        const x = Math.cos(seed + 2) * 10000;
        return x - Math.floor(x);
      };
      const vars = simulateFlight(
        { positionMode: "translate", x: 0, y: 0, rotate: 12 },
        { random },
      ) as Record<string, string>;
      const endY = Number.parseFloat(vars["--lantern-y"]);
      expect(endY).toBeLessThanOrEqual(0);
      expect(vars["--lantern-opacity"]).toBe("0");
      expect(vars["--lantern-scale"]).toBe("0");
      expect(vars["--lantern-rotate"]).toBe("12deg");
    }
  });

  it("is reproducible with a seeded random", () => {
    const random = () => 0.5;
    const a = simulateFlight({ positionMode: "percent" }, { random });
    const b = simulateFlight({ positionMode: "percent" }, { random });
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
    const stepCount = Math.ceil(LANTERN_FLIGHT_EXIT_MS / LANTERN_FLIGHT_STEP_MS);

    expect(onStep).toHaveBeenCalledTimes(1);

    for (let step = 1; step < stepCount; step += 1) {
      jest.advanceTimersByTime(LANTERN_FLIGHT_STEP_MS);
      expect(onStep).toHaveBeenCalledTimes(step + 1);
    }

    jest.advanceTimersByTime(LANTERN_FLIGHT_EXIT_MS - (stepCount - 1) * LANTERN_FLIGHT_STEP_MS);
    await promise;
    expect(onStep).toHaveBeenCalledTimes(stepCount);
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
