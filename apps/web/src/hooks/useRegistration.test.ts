import { act, renderHook } from "@testing-library/react";
import { useRegistration } from "./useRegistration";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components/ComicToast", () => ({ comicToast: { error: jest.fn(), success: jest.fn() } }));
jest.mock("@/api/authentication", () => ({
  fetchUsernameAvailability: jest.fn(),
  registerWithEmailAndPassword: jest.fn(),
  continueWithGoogleCredential: jest.fn(),
}));

const authApi = jest.requireMock("@/api/authentication") as {
  continueWithGoogleCredential: jest.Mock;
};
const { comicToast } = jest.requireMock("@/components/ComicToast") as { comicToast: { error: jest.Mock } };

describe("useRegistration.signUpWithGoogle", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates or signs into the account with the Google credential", async () => {
    authApi.continueWithGoogleCredential.mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useRegistration({ onSuccess }));

    await act(() => result.current.signUpWithGoogle("google-credential"));

    expect(authApi.continueWithGoogleCredential).toHaveBeenCalledWith("google-credential");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("reports a failure without calling onSuccess", async () => {
    authApi.continueWithGoogleCredential.mockRejectedValue(new Error("401"));
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useRegistration({ onSuccess }));

    await act(() => result.current.signUpWithGoogle("google-credential"));

    expect(onSuccess).not.toHaveBeenCalled();
    expect(comicToast.error).toHaveBeenCalledWith("googleSignInFailed");
  });
});
