import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { getTabId } from "./utils/tabId";
import Cookies from "js-cookie";
import {
  hasCsrfCookie,
  isAuthRefreshSkippedError,
  refreshAuthSession,
} from "./authRefresh";
import {
  enqueueAuthRequest,
  shouldEnqueueAuthRequest,
  type AuthQueuedRequestConfig,
} from "./authRequestQueue";

export const TAB_HEADER_KEY = "x-tab-id";
export const AUTH_REQUIRED_EVENT = "gpderp:auth-required";

export type AuthRequiredDetail = {
  reason: string;
  message: string;
  originalUrl?: string;
  method?: string;
  status?: number;
  refreshFailed?: boolean;
  tabId?: string;
  /** When true, useAuthentication must not POST /auth/debug-auth-log (API already logged, or anonymous). */
  skipDebugLog?: boolean;
  detail?: Record<string, unknown>;
};

export {
  AuthRequiredError,
  cancelAuthRequestQueue,
  enqueueAuthRequest,
  flushAuthRequestQueue,
  shouldEnqueueAuthRequest,
} from "./authRequestQueue";

export const notifyAuthRequired = (detail: AuthRequiredDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AuthRequiredDetail>(AUTH_REQUIRED_EVENT, {
      detail: {
        ...detail,
        tabId: detail.tabId ?? getTabId(),
      },
    }),
  );
};

const cookiePresenceDetail = () => ({
  hasAccess: Boolean(Cookies.get("access_token")),
  hasCsrf: hasCsrfCookie(),
});

/** Final 401 after refresh is exhausted: open login; hold non-GET mutations. */
const handleAuthRequired = (
  err: unknown,
  originalConfig: AuthQueuedRequestConfig,
  meta: Omit<AuthRequiredDetail, "originalUrl" | "method" | "status" | "tabId">,
) => {
  const axiosErr = err as AxiosError | undefined;
  notifyAuthRequired({
    ...meta,
    originalUrl: String(originalConfig.url ?? ""),
    method: originalConfig.method,
    status: axiosErr?.response?.status,
    tabId: getTabId(),
  });
  if (shouldEnqueueAuthRequest(originalConfig)) {
    return enqueueAuthRequest(originalConfig);
  }
  return Promise.reject(err);
};

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const isBrowserLocalDevHost = () => {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
};
if (!axios.defaults.baseURL && isBrowserLocalDevHost()) {
  // Dev fallback: avoid hitting Next.js (:3000) when API base URL is not configured.
  axios.defaults.baseURL = "http://localhost:4000";
}
axios.defaults.timeout = 120_000;
axios.defaults.withCredentials = true;

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers[TAB_HEADER_KEY] = getTabId();

axios.interceptors.request.use((config) => {
  config.headers[TAB_HEADER_KEY] = getTabId();

  // Optional: support a non-cookie auth mechanism for dev or internal tooling.
  // Cookie-based JWT auth is the default and requires no `Authorization` header.
  const token = process.env.NEXT_PUBLIC_API_KEY;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // CSRF double-submit: backend expects `x-csrf-token` header for refresh/logout.
  // The value is stored in the readable `csrf_token` cookie.
  const csrfToken = Cookies.get("csrf_token");

  const url = config.url ?? "";
  const isCsrfProtectedAuthEndpoint =
    config.method?.toLowerCase() === "post" &&
    (url.startsWith("/auth/refresh") ||
      url.startsWith("/auth/logout") ||
      url.startsWith("/auth/complete-registration"));

  if (isCsrfProtectedAuthEndpoint && csrfToken) {
    config.headers["x-csrf-token"] = csrfToken;
  }

  return config;
});

// Ensure consecutive requests stay authenticated by transparently refreshing once on 401.
axios.interceptors.response.use(
  (response) => response,
  async (err) => {
    const status = err?.response?.status;
    const originalConfig = err?.config as AxiosRequestConfig & {
      _retry?: boolean;
      _authReplay?: boolean;
    };

    if (!status || status !== 401) return Promise.reject(err);
    if (!originalConfig || !("url" in originalConfig)) return Promise.reject(err);
    if (!originalConfig.url) return Promise.reject(err);

    const url = String(originalConfig.url);

    // Don't attempt refresh for the refresh/logout endpoint itself.
    // Reject quietly so the outer caller emits at most one AUTH_REQUIRED (no refresh_endpoint_401 echo).
    if (url.startsWith("/auth/refresh") || url.startsWith("/auth/logout")) {
      return Promise.reject(err);
    }

    // Replayed requests that still 401 should not re-enter the queue.
    if (originalConfig._authReplay) {
      return handleAuthRequired(err, originalConfig, {
        reason: "auth_replay_still_401",
        message: "auth: replayed request still returned 401 after login",
      });
    }

    if (originalConfig._retry) {
      return handleAuthRequired(err, originalConfig, {
        reason: "retry_still_401",
        message: "auth: request still 401 after refresh retry",
      });
    }
    originalConfig._retry = true;

    // No CSRF cookie: already anonymous / cleared — open login without debug_auth_logs noise.
    if (!hasCsrfCookie()) {
      return handleAuthRequired(err, originalConfig, {
        reason: "anonymous_unauthenticated",
        message: "auth: 401 with no csrf_token; skipping refresh",
        skipDebugLog: true,
        detail: cookiePresenceDetail(),
      });
    }

    try {
      await refreshAuthSession();
      return axios(originalConfig);
    } catch (refreshErr) {
      if (isAuthRefreshSkippedError(refreshErr)) {
        return handleAuthRequired(refreshErr, originalConfig, {
          reason: "anonymous_unauthenticated",
          message: "auth: refresh skipped — csrf_token cookie missing",
          skipDebugLog: true,
          detail: cookiePresenceDetail(),
        });
      }
      // API already wrote debug_auth_logs for refresh/CSRF clears; skip client mirror.
      return handleAuthRequired(refreshErr, originalConfig, {
        reason: "refresh_failed",
        message: "auth: refreshAuthSession failed after API 401; clearing client session",
        refreshFailed: true,
        skipDebugLog: true,
        detail: {
          failedRefreshUrl: "/auth/refresh",
          ...cookiePresenceDetail(),
        },
      });
    }
  },
);
