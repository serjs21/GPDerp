import {
  LANTERN_FLIGHT_EXIT_MS,
  initialFlightCssVars,
  simulateFlight,
} from "./simulateFlight";

describe("simulateFlight", () => {
  it("exports 2s duration constant", () => {
    expect(LANTERN_FLIGHT_EXIT_MS).toBe(2000);
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
