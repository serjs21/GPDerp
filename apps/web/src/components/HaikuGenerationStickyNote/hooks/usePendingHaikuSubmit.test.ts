import { renderHook, waitFor } from "@testing-library/react";
import { runHaikuAgent } from "@/api/agents";
import { PENDING_HAIKU_SUBJECT_STORAGE_KEY } from "@/config/userConfiguration";
import { usePendingHaikuSubmit } from "./usePendingHaikuSubmit";

jest.mock("@/api/agents", () => ({
  runHaikuAgent: jest.fn(),
}));

const mockRunHaikuAgent = runHaikuAgent as jest.MockedFunction<typeof runHaikuAgent>;

const mockUseAuthenticationState = jest.fn();
jest.mock("@/app/providers/AuthenticationProvider", () => ({
  useAuthenticationState: () => mockUseAuthenticationState(),
}));

describe("usePendingHaikuSubmit", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockRunHaikuAgent.mockReset();
    mockRunHaikuAgent.mockResolvedValue({} as never);
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
});
