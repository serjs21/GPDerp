import type { ErrorEvent } from "@sentry/node";

/** Request headers that carry credentials or session/tab identifiers; never sent to the error tracker. */
export const SENSITIVE_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-csrf-token",
  "x-tab-id",
  "x-api-key",
  "sec-websocket-protocol",
] as const;

const SENSITIVE_HEADER_SET = new Set<string>(SENSITIVE_HEADERS);

export const stripQuery = (url: string): string => url.split(/[?#]/, 1)[0];

/**
 * Removes credentials, bodies, query strings and user details (except the internal id) from an
 * error event before it leaves the server. Query strings can hold one-time tokens (verification,
 * password reset), and bodies can hold passwords or user content.
 */
export function scrubEvent<T extends Pick<ErrorEvent, "request" | "user">>(event: T): T {
  const request = event.request;
  if (request) {
    delete request.cookies;
    delete request.data;
    delete request.query_string;
    if (request.url) request.url = stripQuery(request.url);
    if (request.headers) {
      request.headers = Object.fromEntries(
        Object.entries(request.headers).filter(([name]) => !SENSITIVE_HEADER_SET.has(name.toLowerCase())),
      );
    }
  }
  if (event.user) {
    event.user = event.user.id === undefined ? {} : { id: event.user.id };
  }
  return event;
}
