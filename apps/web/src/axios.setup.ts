import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { getTabId } from "./utils/tabId";
import Cookies from "js-cookie";

export const TAB_HEADER_KEY = "x-tab-id";

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
    (url.startsWith("/auth/refresh") || url.startsWith("/auth/logout"));

  if (isCsrfProtectedAuthEndpoint && csrfToken) {
    config.headers["x-csrf-token"] = csrfToken;
  }

  return config;
});

// Ensure consecutive requests stay authenticated by transparently refreshing once on 401.
let refreshInFlight: Promise<void> | null = null;

axios.interceptors.response.use(
  (response) => response,
  async (err) => {
    const status = err?.response?.status;
    const originalConfig = err?.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!status || status !== 401) return Promise.reject(err);
    if (!originalConfig || !("url" in originalConfig)) return Promise.reject(err);
    if (!originalConfig.url) return Promise.reject(err);

    const url = String(originalConfig.url);

    // Don't attempt refresh for the refresh/logout endpoint itself.
    if (url.startsWith("/auth/refresh") || url.startsWith("/auth/logout")) {
      return Promise.reject(err);
    }

    if (originalConfig._retry) return Promise.reject(err);
    originalConfig._retry = true;

    try {
      if (!refreshInFlight) {
        refreshInFlight = axios.post("/auth/refresh").then(() => undefined).finally(() => {
          refreshInFlight = null;
        });
      }

      await refreshInFlight;
      return axios(originalConfig);
    } catch (refreshErr) {
      refreshInFlight = null;
      return Promise.reject(refreshErr);
    }
  },
);