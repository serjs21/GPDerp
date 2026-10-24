/** Paddle publishes its webhook source IPs here; the list can change, so it is fetched, never hard-coded. */
export const PADDLE_IPS_URL = {
  production: "https://api.paddle.com/ips",
  sandbox: "https://sandbox-api.paddle.com/ips",
} as const;

export const PADDLE_IPS_REFRESH_MS = 6 * 60 * 60 * 1000;
/** Retry interval while no list has been loaded yet (webhooks get 503 and Paddle retries them). */
export const PADDLE_IPS_RETRY_MS = 60 * 1000;
export const PADDLE_IPS_FETCH_TIMEOUT_MS = 10_000;
