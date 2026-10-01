import { act, renderHook, waitFor } from "@testing-library/react";
import { fetchCredits, GENERATION_CREDITS_UPDATED_EVENT } from "@/api/payments";
import { useGenerationCredits } from "./useGenerationCredits";

jest.mock("@/api/payments", () => ({
  fetchCredits: jest.fn(),
  GENERATION_CREDITS_UPDATED_EVENT: "gpderp:generation-credits-updated",
}));

const mockedFetchCredits = fetchCredits as jest.MockedFunction<typeof fetchCredits>;

describe("useGenerationCredits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads credits on mount", async () => {
    mockedFetchCredits.mockResolvedValue({ credits: 4 });
    const { result } = renderHook(() => useGenerationCredits());

    await waitFor(() => expect(result.current.loadingCredits).toBe(false));
    expect(mockedFetchCredits).toHaveBeenCalledTimes(1);
    expect(result.current.credits).toBe(4);
  });

  it("falls back to null when the request fails", async () => {
    mockedFetchCredits.mockRejectedValue(new Error("Unauthorized"));
    const { result } = renderHook(() => useGenerationCredits());

    await waitFor(() => expect(result.current.loadingCredits).toBe(false));
    expect(result.current.credits).toBeNull();
  });

  it("applies credits broadcast via the update event", async () => {
    mockedFetchCredits.mockResolvedValue({ credits: 4 });
    const { result } = renderHook(() => useGenerationCredits());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    act(() => {
      window.dispatchEvent(
        new CustomEvent(GENERATION_CREDITS_UPDATED_EVENT, { detail: { credits: 104 } }),
      );
    });

    expect(result.current.credits).toBe(104);
  });
});
