import { render } from "@testing-library/react";
import { BlackHoleWhirlpool } from "./BlackHoleWhirlpool";

describe("BlackHoleWhirlpool", () => {
  it("renders root and character spans", () => {
    const { container } = render(
      <BlackHoleWhirlpool duration={800} rotationSpeed={0.2} insideTransformEaseInPower={2}>
        Login Register
      </BlackHoleWhirlpool>,
    );
    expect(container.querySelector(".black-hole-root")).toBeInTheDocument();
    expect(container.querySelectorAll(".black-hole-char").length).toBeGreaterThan(0);
  });
});
