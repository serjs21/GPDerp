import { fireEvent, render, screen } from "@testing-library/react";

const reportBoundaryError = jest.fn();
jest.mock("@/utils/monitoring/apiFailure", () => ({
  reportBoundaryError: (...args: unknown[]) => reportBoundaryError(...args),
}));
jest.mock("@/components/ErrorFallback", () => ({
  ErrorFallback: ({ onRetry }: { onRetry: () => void }) => (
    <button type="button" onClick={onRetry}>
      retry
    </button>
  ),
}));

import AppError from "./error";

describe("app error boundary", () => {
  it("reports the caught error once and retries via reset", () => {
    const error = new Error("render failed");
    const reset = jest.fn();
    const { rerender } = render(<AppError error={error} reset={reset} />);
    rerender(<AppError error={error} reset={reset} />);

    expect(reportBoundaryError).toHaveBeenCalledTimes(1);
    expect(reportBoundaryError).toHaveBeenCalledWith(error, "app");

    fireEvent.click(screen.getByRole("button", { name: "retry" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
