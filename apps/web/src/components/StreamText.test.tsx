import React from "react";
import { render } from "@testing-library/react";
import { StreamText } from "./StreamText";

jest.mock("motion/react", () => {
  const React = require("react");
  return {
    motion: {
      span: React.forwardRef(
        (
          {
            onAnimationComplete,
            initial,
            animate,
            exit,
            transition,
            ...props
          }: any,
          ref: any
        ) => {
          React.useEffect(() => {
            onAnimationComplete?.();
          }, [onAnimationComplete]);
          return <span ref={ref} {...props} />;
        }
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

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
    const underline = container.querySelector("[aria-hidden]");
    expect(underline).toBeInTheDocument();
  });

  it("calls onDone when typing animation completes", () => {
    const onDone = jest.fn();
    render(<StreamText text="hi" onDone={onDone} />);
    expect(onDone).toHaveBeenCalled();
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
    expect(container.textContent).toContain("instant");
  });
});
