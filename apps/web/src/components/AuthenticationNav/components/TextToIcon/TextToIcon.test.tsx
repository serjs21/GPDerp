import { act, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { TextToIcon } from "./TextToIcon";

jest.mock("../../../animations/BlackHoleWhirlpool/BlackHoleWhirlpool", () => ({
  BlackHoleWhirlpool: ({ children }: { children: ReactNode }) => (
    <span data-testid="mock-black-hole">{children}</span>
  ),
}));

describe("TextToIcon", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("keeps text-exit non-interruptible and applies queued target after completion", () => {
    const { rerender } = render(
      <TextToIcon
        side="register"
        label="Register"
        dominant={false}
        targetMode="icon"
        canShowText
        transitionDelayMs={0}
        transitionDurationMs={800}
        transitionKey={1}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Try to interrupt while textExit is in progress.
    rerender(
      <TextToIcon
        side="register"
        label="Register"
        dominant={false}
        targetMode="text"
        canShowText
        transitionDelayMs={0}
        transitionDurationMs={800}
        transitionKey={2}
      />,
    );

    // During locked exit, icon should still be absent.
    expect(document.querySelector(".syl-anime-label")).not.toBeInTheDocument();
    expect(document.querySelector(".syl-anime-symbol")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(810);
    });

    // After exit completes, queued target restores text.
    expect(document.querySelector(".syl-anime-label")).toBeInTheDocument();
  });

  it("forces icon rendering when text cannot be shown safely", () => {
    render(
      <TextToIcon
        side="login"
        label="Login"
        dominant={false}
        targetMode="text"
        canShowText={false}
        transitionDelayMs={0}
        transitionDurationMs={800}
        transitionKey={1}
      />,
    );

    expect(document.querySelector(".syl-anime-label")).not.toBeInTheDocument();
    expect(document.querySelector(".syl-anime-symbol")).toBeInTheDocument();
  });
});
