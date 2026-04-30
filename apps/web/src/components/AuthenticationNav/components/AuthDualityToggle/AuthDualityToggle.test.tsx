import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { AuthDualityToggle } from "./AuthDualityToggle";

type TextToIconMockProps = {
  side: "login" | "register";
  targetMode: "text" | "icon";
  dominant: boolean;
};

const latestBySide: Record<string, TextToIconMockProps> = {};

jest.mock("../TextToIcon/TextToIcon", () => ({
  TextToIcon: (props: TextToIconMockProps) => {
    latestBySide[props.side] = props;
    return <span data-testid={`mock-text-to-icon-${props.side}`} />;
  },
}));

jest.mock("motion/react", () => {
  return {
    useReducedMotion: () => false,
    motion: {
      button: ({ children, ...props }: { children: ReactNode }) => {
        const buttonProps = { ...(props as Record<string, unknown>) };
        delete buttonProps.initial;
        delete buttonProps.animate;
        delete buttonProps.transition;
        return <button {...buttonProps}>{children}</button>;
      },
    },
  };
});

describe("AuthDualityToggle", () => {
  beforeEach(() => {
    Object.keys(latestBySide).forEach((key) => {
      delete latestBySide[key];
    });
  });

  it("locks the clicked side until onClose token changes", () => {
    const { rerender } = render(<AuthDualityToggle onClose={0} />);

    const root = screen.getByTestId("auth-duality-toggle");
    const loginButton = screen.getByRole("button", { name: "Login" });
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.click(loginButton);
    fireEvent.pointerEnter(registerButton);

    expect(latestBySide.login.dominant).toBe(true);
    expect(latestBySide.register.dominant).toBe(false);

    rerender(<AuthDualityToggle onClose={1} />);
    fireEvent.pointerLeave(root);
    fireEvent.pointerEnter(registerButton);

    expect(latestBySide.register.dominant).toBe(true);
  });

  it("resets to idle state when onClose token changes", () => {
    const { rerender } = render(<AuthDualityToggle onClose={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(latestBySide.login.dominant).toBe(true);
    expect(latestBySide.register.dominant).toBe(false);

    rerender(<AuthDualityToggle onClose={1} />);

    expect(latestBySide.login.dominant).toBe(false);
    expect(latestBySide.register.dominant).toBe(false);
  });

  it("does not re-hover from existing pointer position immediately after close", () => {
    const { rerender } = render(<AuthDualityToggle onClose={0} />);
    const root = screen.getByTestId("auth-duality-toggle");
    const loginButton = screen.getByRole("button", { name: "Login" });
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.click(loginButton);
    expect(latestBySide.login.dominant).toBe(true);

    rerender(<AuthDualityToggle onClose={1} />);
    expect(latestBySide.register.dominant).toBe(false);

    fireEvent.pointerLeave(root);
    fireEvent.pointerEnter(registerButton);
    expect(latestBySide.register.dominant).toBe(true);
  });

  it("stays idle if focus returns after close until pointer re-enters", () => {
    const { rerender } = render(<AuthDualityToggle onClose={0} />);
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    rerender(<AuthDualityToggle onClose={1} />);

    // Simulate modal returning focus to a toggle button.
    fireEvent.focus(registerButton);
    expect(latestBySide.register.dominant).toBe(false);

    // First real pointer enter after close is allowed.
    fireEvent.pointerEnter(registerButton);
    expect(latestBySide.register.dominant).toBe(true);
  });

  it("uses labels from props for accessible names", () => {
    render(<AuthDualityToggle loginLabel="Sign In" registerLabel="Create Account" />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });
});
