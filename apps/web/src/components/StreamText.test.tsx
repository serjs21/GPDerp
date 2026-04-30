import React from "react";
import { render } from "@testing-library/react";
import { StreamText } from "./StreamText";

describe("StreamText", () => {
  it("renders all characters from the text prop", () => {
    const { container } = render(<StreamText text="hello" />);
    expect(container.textContent).toContain("hello");
  });

  it("replaces spaces with non-breaking spaces", () => {
    const { container } = render(<StreamText text="a b" />);
    expect(container.textContent).toContain("\u00A0");
  });

  it("renders an underline element", () => {
    const { container } = render(<StreamText text="test" />);
    const styleTag = container.querySelector("style");
    expect(styleTag?.textContent).toContain("ct-underline");
  });

  it("calls onDone when typing animation completes", () => {
    const originalRaf = window.requestAnimationFrame;
    const originalCancelRaf = window.cancelAnimationFrame;
    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      callback(performance.now() + 2000);
      return 1;
    };
    window.cancelAnimationFrame = () => {};

    const onDone = jest.fn();
    render(<StreamText text="hi" totalMs={1} onDone={onDone} />);
    expect(onDone).toHaveBeenCalled();

    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
  });

  it("applies custom className", () => {
    const { container } = render(<StreamText text="x" className="custom" />);
    expect(container.firstElementChild).toHaveClass("custom");
  });

  it("applies custom style", () => {
    const { container } = render(
      <StreamText text="x" style={{ fontSize: "2rem" }} />
    );
    expect(container.firstElementChild).toHaveStyle({ fontSize: "2rem" });
  });

  it("renders text immediately when startOnMount is false", () => {
    const { container } = render(
      <StreamText text="instant" startOnMount={false} />
    );
    expect(container.textContent).not.toContain("instant");
  });
});
