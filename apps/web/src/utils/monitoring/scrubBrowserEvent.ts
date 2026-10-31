import type { ErrorEvent } from "@sentry/react";

/** Only these request headers (added by the SDK's HTTP context) may be sent. */
const ALLOWED_HEADERS = new Set(["user-agent"]);

export const stripUrlQuery = (url: string): string => url.split(/[?#]/, 1)[0];

/**
 * Keeps error reports to the minimum: page URL without query string or fragment (they can hold
 * one-time tokens), the user agent, and no cookies, referrer, user details or breadcrumbs.
 */
export function scrubBrowserEvent<T extends Pick<ErrorEvent, "request" | "user" | "breadcrumbs">>(event: T): T {
  const request = event.request;
  if (request) {
    delete request.cookies;
    delete request.data;
    delete request.query_string;
    if (request.url) request.url = stripUrlQuery(request.url);
    if (request.headers) {
      request.headers = Object.fromEntries(
        Object.entries(request.headers).filter(([name]) => ALLOWED_HEADERS.has(name.toLowerCase())),
      );
    }
  }
  delete event.user;
  delete event.breadcrumbs;
  return event;
}
