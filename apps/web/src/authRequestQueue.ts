import type { AxiosRequestConfig, AxiosResponse } from "axios";

export type AuthQueuedRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _authReplay?: boolean;
};

type QueuedAuthRequest = {
  config: AuthQueuedRequestConfig;
  resolve: (value: AxiosResponse) => void;
  reject: (reason?: unknown) => void;
};

export class AuthRequiredError extends Error {
  readonly name = "AuthRequiredError";

  constructor(message = "Authentication required") {
    super(message);
  }
}

const AUTH_BOOTSTRAP_PREFIXES = [
  "/auth/refresh",
  "/auth/logout",
  "/auth/login",
  "/auth/register",
  "/auth/google/login",
  "/auth/complete-registration",
] as const;

let queue: QueuedAuthRequest[] = [];

export function getAuthRequestQueueLength(): number {
  return queue.length;
}

/** Reset queue between tests. */
export function clearAuthRequestQueueForTests(): void {
  queue = [];
}

export function isAuthBootstrapUrl(url: string): boolean {
  return AUTH_BOOTSTRAP_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Whether a failed request should be held and replayed after login.
 * GET and auth bootstrap endpoints are never queued.
 */
export function shouldEnqueueAuthRequest(config: AuthQueuedRequestConfig): boolean {
  if (config._authReplay) return false;
  const method = (config.method ?? "get").toLowerCase();
  if (method === "get") return false;
  const url = String(config.url ?? "");
  if (!url || isAuthBootstrapUrl(url)) return false;
  return true;
}

export function enqueueAuthRequest(
  config: AuthQueuedRequestConfig,
): Promise<AxiosResponse> {
  const queuedConfig: AuthQueuedRequestConfig = { ...config };
  delete queuedConfig._retry;
  queuedConfig._authReplay = false;

  return new Promise<AxiosResponse>((resolve, reject) => {
    queue.push({ config: queuedConfig, resolve, reject });
  });
}

export async function flushAuthRequestQueue(
  request: (config: AuthQueuedRequestConfig) => Promise<AxiosResponse>,
): Promise<void> {
  const pending = queue;
  queue = [];

  for (const item of pending) {
    const replayConfig: AuthQueuedRequestConfig = {
      ...item.config,
      _authReplay: true,
    };
    delete replayConfig._retry;

    try {
      const response = await request(replayConfig);
      item.resolve(response);
    } catch (error) {
      item.reject(error);
    }
  }
}

export function cancelAuthRequestQueue(reason?: unknown): void {
  const pending = queue;
  queue = [];
  const error = reason ?? new AuthRequiredError();
  for (const item of pending) {
    item.reject(error);
  }
}
