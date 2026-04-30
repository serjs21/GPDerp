import { render } from "@testing-library/react";
import { BlackHoleWhirlpool } from "../../src/components/animations/BlackHoleWhirlpool/BlackHoleWhirlpool";
import { WashInSea } from "../../src/components/animations/WashInSea/WashInSea";

describe("storybook animation primitives render sanity", () => {
  it("renders WashInSea animation container", () => {
    const { container } = render(
      <WashInSea direction="right" duration={1200}>
        Login Register
      </WashInSea>,
    );
    expect(container.querySelector(".wash-sea-root")).toBeInTheDocument();
    expect(container.querySelectorAll(".wash-sea-char").length).toBeGreaterThan(0);
  });

  it("renders BlackHoleWhirlpool animation container", () => {
    const { container } = render(
      <BlackHoleWhirlpool duration={1200} rotationSpeed={0.2} insideTransformEaseInPower={2}>
        Login Register
      </BlackHoleWhirlpool>,
    );
    expect(container.querySelector(".black-hole-root")).toBeInTheDocument();
    expect(container.querySelectorAll(".black-hole-char").length).toBeGreaterThan(0);
  });
});
