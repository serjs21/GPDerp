import { fireEvent, render, screen } from "@testing-library/react";
import { AuthDualityToggleDemo } from "../../src/components/AuthenticationNav/components/AuthDualityToggleDemo/AuthDualityToggleDemo";
import { AuthDualityToggle } from "../../src/components/AuthenticationNav/components/AuthDualityToggle/AuthDualityToggle";

describe("storybook auth duality components render sanity", () => {
  it("renders AuthDualityToggle without crashing", () => {
    render(<AuthDualityToggle />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("renders AuthDualityToggleDemo wrapper and opens mock modal", () => {
    render(<AuthDualityToggleDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(screen.getByText("Mock Login Modal")).toBeInTheDocument();
  });
});
