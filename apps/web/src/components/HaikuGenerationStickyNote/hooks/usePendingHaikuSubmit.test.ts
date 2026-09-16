import { renderHook, waitFor } from "@testing-library/react";
import { isInsufficientCreditsError, runHaikuAgent } from "@/api/agents";
import { PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY, PENDING_HAIKU_SUBJECT_STORAGE_KEY } from "@/config/userConfiguration";
import { usePendingHaikuSubmit } from "./usePendingHaikuSubmit";

jest.mock("@/api/agents", () => ({
  runHaikuAgent: jest.fn(),
  isInsufficientCreditsError: jest.fn(() => false),
}));

const mockRunHaikuAgent = runHaikuAgent as jest.MockedFunction<typeof runHaikuAgent>;
const mockIsInsufficientCreditsError = isInsufficientCreditsError as jest.MockedFunction<
  typeof isInsufficientCreditsError
>;

const mockUseAuthenticationState = jest.fn();
jest.mock("@/app/providers/AuthenticationProvider", () => ({
  useAuthenticationState: () => mockUseAuthenticationState(),
}));

describe("usePendingHaikuSubmit", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockRunHaikuAgent.mockReset();
    mockRunHaikuAgent.mockResolvedValue({} as never);
    mockIsInsufficientCreditsError.mockReturnValue(false);
    mockUseAuthenticationState.mockReturnValue({
      isLoggedIn: false,
      initialized: true,
    });
  });

  it("resumes pending subject after login", async () => {
    window.localStorage.setItem(PENDING_HAIKU_SUBJECT_STORAGE_KEY, "Morning mist");

    const setSubject = jest.fn();
    const setIsLoading = jest.fn();
    const onError = jest.fn();

    mockUseAuthenticationState.mockReturnValue({
      isLoggedIn: true,
      initialized: true,
    });

    renderHook(() =>
      usePendingHaikuSubmit({ setSubject, setIsLoading, onError }),
    );

    await waitFor(() => {
      expect(mockRunHaikuAgent).toHaveBeenCalledWith("Morning mist");
    });

    expect(window.localStorage.getItem(PENDING_HAIKU_SUBJECT_STORAGE_KEY)).toBeNull();
    expect(setSubject).toHaveBeenCalledWith("");
  });

  it("opens the no-credits flow and stores the subject when generation returns 402", async () => {
    mockUseAuthenticationState.mockReturnValue({
      isLoggedIn: true,
      initialized: true,
    });
    mockIsInsufficientCreditsError.mockReturnValue(true);
    mockRunHaikuAgent.mockRejectedValue(new Error("insufficient_credits"));

    const { result } = renderHook(() =>
      usePendingHaikuSubmit({
        setSubject: jest.fn(),
        setIsLoading: jest.fn(),
        onError: jest.fn(),
      }),
    );

    await result.current.runAgent("Rain on stone");

    expect(window.localStorage.getItem(PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY)).toBe("Rain on stone");
  });
});
