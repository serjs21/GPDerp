import { fireEvent, render, screen } from "@testing-library/react";
import { AuthDualityToggleDemo } from "./AuthDualityToggleDemo";

describe("AuthDualityToggleDemo", () => {
  it("opens and closes the mock login modal", () => {
    render(<AuthDualityToggleDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(screen.getByText("Mock Login Modal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Mock Login Modal")).not.toBeInTheDocument();
  });
});
