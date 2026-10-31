import axios, { type AxiosError } from "axios";
import * as Sentry from "@sentry/react";

export const REQUEST_ID_HEADER = "x-request-id";

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_SEGMENT = /^\d+$/;
/** Share hashes and similar opaque tokens: long, mixed letters and digits. */
const OPAQUE_SEGMENT = /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z0-9_-]{16,}$/;

/** Path without query/fragment, with ids and opaque tokens replaced so routes group together. */
export function normalizeRoute(urlOrPath: string): string {
  const path = urlOrPath.replace(/^[a-z]+:\/\/[^/]+/i, "").split(/[?#]/, 1)[0] || "/";
  return path
    .split("/")
    .map((segment) =>
      UUID_SEGMENT.test(segment) || NUMERIC_SEGMENT.test(segment) || OPAQUE_SEGMENT.test(segment) ? ":id" : segment,
    )
    .join("/");
}

/** Only server failures are unexpected; 4xx are validation/auth outcomes the UI already handles. */
export function shouldReportApiError(error: unknown): boolean {
  if (axios.isCancel(error) || !axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status !== undefined && status >= 500;
}

export const newRequestId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const headerValue = (value: unknown): string | undefined => (typeof value === "string" && value ? value : undefined);

const currentPageRoute = () => (typeof window === "undefined" ? undefined : normalizeRoute(window.location.pathname));

export type ApiFailureTags = {
  api_route: string;
  page_route: string | undefined;
  method: string;
  status_code: string;
  request_id: string | undefined;
};

/** Correlation tags for a failed API call; the request id is the API's echo, else the one we sent. */
export function apiFailureTags(error: AxiosError): ApiFailureTags {
  const config = error.config;
  return {
    api_route: normalizeRoute(config?.url ?? ""),
    page_route: currentPageRoute(),
    method: (config?.method ?? "get").toUpperCase(),
    status_code: String(error.response?.status ?? 0),
    request_id:
      headerValue(error.response?.headers?.[REQUEST_ID_HEADER]) ?? headerValue(config?.headers?.[REQUEST_ID_HEADER]),
  };
}

/** Reports a 5xx API response once, grouped by method + route + status, with the request id. */
export function reportApiFailure(error: unknown): void {
  if (!shouldReportApiError(error) || !Sentry.isInitialized()) return;
  const tags = apiFailureTags(error as AxiosError);
  Sentry.withScope((scope) => {
    scope.setTags(tags);
    scope.setFingerprint(["api-failure", tags.method, tags.api_route, tags.status_code]);
    scope.setLevel("error");
    scope.captureMessage(`API ${tags.status_code} ${tags.method} ${tags.api_route}`);
  });
}

/** Errors caught by a React error boundary. */
export function reportBoundaryError(error: unknown, boundary: string): void {
  if (!Sentry.isInitialized()) return;
  Sentry.withScope((scope) => {
    scope.setTag("boundary", boundary);
    scope.setTag("page_route", currentPageRoute());
    scope.captureException(error);
  });
}
