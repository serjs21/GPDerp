import React from "react";
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  GoogleAuthentication,
  decodeJwtPayload,
  GoogleUser,
} from "./GoogleAuthentication";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CLIENT_ID = "test-client-id.apps.googleusercontent.com";

const mockProfile: GoogleUser = {
  sub: "1234567890",
  name: "Taro Yamada",
  email: "taro@example.com",
  picture: "https://example.com/avatar.jpg",
};

/** Build a fake JWT whose payload is the given object. */
function fakeJwt(payload: object): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
}

const FAKE_JWT = fakeJwt(mockProfile);

// ── Mock window.google ────────────────────────────────────────────────────────

let capturedCallback: ((response: { credential: string }) => void) | null =
  null;

const mockInitialize = jest.fn((config: { callback: (r: { credential: string }) => void }) => {
  capturedCallback = config.callback;
});
const mockRenderButton = jest.fn();
const mockDisableAutoSelect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  capturedCallback = null;

  // Clear cookies
  document.cookie = "g_auth_credential=; max-age=0; path=/";

  window.google = {
    accounts: {
      id: {
        initialize: mockInitialize,
        renderButton: mockRenderButton,
        prompt: jest.fn(),
        disableAutoSelect: mockDisableAutoSelect,
      },
    },
  };
});

afterEach(() => {
  delete window.google;
});

// ── Simulate GSI callback ─────────────────────────────────────────────────────

const simulateSignIn = () => {
  act(() => {
    capturedCallback?.({ credential: FAKE_JWT });
  });
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("decodeJwtPayload", () => {
  it("decodes a JWT payload to the user object", () => {
    const result = decodeJwtPayload(FAKE_JWT);
    expect(result.name).toBe("Taro Yamada");
    expect(result.email).toBe("taro@example.com");
    expect(result.sub).toBe("1234567890");
  });
});

describe("GoogleAuthentication — initialisation", () => {
  it("calls google.accounts.id.initialize with the clientId", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: CLIENT_ID })
    );
  });

  it("calls google.accounts.id.renderButton with the login wrapper div", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    expect(mockRenderButton).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ type: "standard" })
    );
  });

  it("renders the login wrapper before sign-in", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
  });
});

describe("GoogleAuthentication — after sign-in", () => {
  it("shows the signed-in view with avatar and name", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    simulateSignIn();

    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getByText("Taro Yamada")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Taro Yamada" })).toHaveAttribute(
      "src",
      mockProfile.picture
    );
  });

  it("hides the login wrapper after sign-in", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    simulateSignIn();

    expect(screen.queryByTestId("login-wrapper")).not.toBeInTheDocument();
  });

  it("calls onLogin with the decoded user profile", () => {
    const onLogin = jest.fn();
    render(<GoogleAuthentication clientId={CLIENT_ID} onLogin={onLogin} />);
    simulateSignIn();

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Taro Yamada", email: "taro@example.com" })
    );
  });

  it("stores the credential JWT in a cookie after sign-in", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    simulateSignIn();

    expect(document.cookie).toContain("g_auth_credential");
  });
});

describe("GoogleAuthentication — session restore from cookie", () => {
  it("restores the signed-in state from an existing cookie", () => {
    // Pre-set the cookie before mounting
    document.cookie = `g_auth_credential=${encodeURIComponent(FAKE_JWT)}; path=/`;

    render(<GoogleAuthentication clientId={CLIENT_ID} />);

    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getByText("Taro Yamada")).toBeInTheDocument();
  });

  it("clears a corrupt cookie and shows login", () => {
    document.cookie = `g_auth_credential=notavalidjwt; path=/`;

    render(<GoogleAuthentication clientId={CLIENT_ID} />);

    expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
    expect(screen.queryByTestId("signed-in")).not.toBeInTheDocument();
  });
});

describe("GoogleAuthentication — sign out", () => {
  it("returns to login wrapper after signing out", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    simulateSignIn();

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
    expect(screen.queryByTestId("signed-in")).not.toBeInTheDocument();
  });

  it("calls google.accounts.id.disableAutoSelect on sign out", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    simulateSignIn();

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(mockDisableAutoSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onLogout callback on sign out", () => {
    const onLogout = jest.fn();
    render(<GoogleAuthentication clientId={CLIENT_ID} onLogout={onLogout} />);
    simulateSignIn();

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("clears the auth cookie on sign out", () => {
    render(<GoogleAuthentication clientId={CLIENT_ID} />);
    simulateSignIn();
    expect(document.cookie).toContain("g_auth_credential");

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(document.cookie).not.toContain("g_auth_credential");
  });
});
