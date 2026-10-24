import { act, renderHook } from "@testing-library/react";
import { useRegistration } from "./useRegistration";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components/ComicToast", () => ({ comicToast: { error: jest.fn(), success: jest.fn() } }));
jest.mock("@/api/authentication", () => ({
  fetchUsernameAvailability: jest.fn(),
  registerWithEmailAndPassword: jest.fn(),
  signUpWithGoogleCredential: jest.fn(),
  loginWithGoogleCredential: jest.fn(),
}));

const authApi = jest.requireMock("@/api/authentication") as {
  signUpWithGoogleCredential: jest.Mock;
  loginWithGoogleCredential: jest.Mock;
};
const { comicToast } = jest.requireMock("@/components/ComicToast") as { comicToast: { error: jest.Mock } };

describe("useRegistration.signUpWithGoogle", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates the account through the sign-up endpoint (not the login-only one)", async () => {
    authApi.signUpWithGoogleCredential.mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useRegistration({ onSuccess }));

    await act(() => result.current.signUpWithGoogle("google-credential"));

    expect(authApi.signUpWithGoogleCredential).toHaveBeenCalledWith("google-credential");
    expect(authApi.loginWithGoogleCredential).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("reports a failure without calling onSuccess", async () => {
    authApi.signUpWithGoogleCredential.mockRejectedValue(new Error("401"));
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useRegistration({ onSuccess }));

    await act(() => result.current.signUpWithGoogle("google-credential"));

    expect(onSuccess).not.toHaveBeenCalled();
    expect(comicToast.error).toHaveBeenCalledWith("googleSignInFailed");
  });
});
