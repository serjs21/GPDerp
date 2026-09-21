import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import {
  AuthRefreshSkippedError,
  hasCsrfCookie,
  isAccessTokenFresh,
  isAuthRefreshSkippedError,
  refreshAuthSession,
} from "./authRefresh";

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("jose", () => ({
  decodeJwt: jest.fn(),
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const CookiesMock = Cookies as unknown as { get: jest.Mock };
const decodeJwtMock = decodeJwt as jest.Mock;
const axios = jest.requireMock("axios").default as { post: jest.Mock };

function mockCookies(map: Record<string, string | undefined>) {
  CookiesMock.get.mockImplementation((name: string) => map[name]);
}

describe("isAccessTokenFresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("is false when the access cookie is missing", () => {
    mockCookies({});
    expect(isAccessTokenFresh()).toBe(false);
  });

  it("is true when exp is still ahead of the skew window", () => {
    mockCookies({ access_token: "token" });
    const now = 1_700_000_000_000;
    decodeJwtMock.mockReturnValue({ exp: Math.floor((now + 60_000) / 1000) });
    expect(isAccessTokenFresh(now)).toBe(true);
  });

  it("is false when exp is inside the skew window", () => {
    mockCookies({ access_token: "token" });
    const now = 1_700_000_000_000;
    decodeJwtMock.mockReturnValue({ exp: Math.floor((now + 1_000) / 1000) });
    expect(isAccessTokenFresh(now)).toBe(false);
  });
});

describe("hasCsrfCookie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("is true when csrf_token is present", () => {
    mockCookies({ csrf_token: "csrf" });
    expect(hasCsrfCookie()).toBe(true);
  });

  it("is false when csrf_token is missing", () => {
    mockCookies({});
    expect(hasCsrfCookie()).toBe(false);
  });
});

describe("refreshAuthSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.post.mockResolvedValue({ data: { ok: true } });
    mockCookies({});
    decodeJwtMock.mockReturnValue({});
    // Prefer deterministic same-tab memory lock in unit tests.
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {},
    });
  });

  it("serializes concurrent callers so only one refresh posts", async () => {
    mockCookies({ csrf_token: "csrf" });
    let resolveFirst!: () => void;
    axios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = () => resolve({ data: { ok: true } });
        }),
    );
    axios.post.mockResolvedValue({ data: { ok: true } });

    const a = refreshAuthSession();
    const b = refreshAuthSession();

    // First caller holds the lock; second is waiting. Only one POST so far.
    await Promise.resolve();
    expect(axios.post).toHaveBeenCalledTimes(1);

    // After the first refresh, access looks fresh so the waiter skips.
    mockCookies({ access_token: "token", csrf_token: "csrf" });
    decodeJwtMock.mockReturnValue({ exp: Math.floor((Date.now() + 60_000) / 1000) });
    resolveFirst();

    await Promise.all([a, b]);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith("/auth/refresh");
  });

  it("skips the network call when another refresh already left a fresh access token", async () => {
    mockCookies({ access_token: "token", csrf_token: "csrf" });
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    decodeJwtMock.mockReturnValue({ exp: Math.floor((1_700_000_000_000 + 60_000) / 1000) });

    await refreshAuthSession();

    expect(axios.post).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it("posts when force is true even if the access token looks fresh", async () => {
    mockCookies({ access_token: "token", csrf_token: "csrf" });
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    decodeJwtMock.mockReturnValue({ exp: Math.floor((1_700_000_000_000 + 60_000) / 1000) });

    await refreshAuthSession({ force: true });

    expect(axios.post).toHaveBeenCalledTimes(1);
    nowSpy.mockRestore();
  });

  it("throws AuthRefreshSkippedError without posting when csrf_token is missing", async () => {
    mockCookies({});

    await expect(refreshAuthSession()).rejects.toBeInstanceOf(AuthRefreshSkippedError);
    expect(axios.post).not.toHaveBeenCalled();
    expect(isAuthRefreshSkippedError(new AuthRefreshSkippedError())).toBe(true);
  });
});
