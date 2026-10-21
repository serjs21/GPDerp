import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/** Returned by a responder to keep the request pending forever (loading states). */
export const STORY_API_PENDING = Symbol("story-api-pending");

export type StoryApiMethod = "get" | "post" | "patch" | "put" | "delete";

export type StoryApiRoute = {
  method?: StoryApiMethod;
  /** Request path without query string (axios `url`), e.g. "/share_links" or /^\/haiku\/labels\//. */
  path: string | RegExp;
  respond: (config: InternalAxiosRequestConfig) => unknown;
};

const never = <T>() => new Promise<T>(() => {});

function requestPath(config: InternalAxiosRequestConfig): string {
  return String(config.url ?? "").split("?")[0];
}

export function matchStoryApiRoute(
  routes: readonly StoryApiRoute[],
  config: InternalAxiosRequestConfig,
): StoryApiRoute | undefined {
  const method = (config.method ?? "get").toLowerCase();
  const path = requestPath(config);
  return routes.find(
    (route) =>
      (route.method ?? "get") === method &&
      (typeof route.path === "string" ? route.path === path : route.path.test(path)),
  );
}

/**
 * Axios adapter that answers only the story's routes: a responder's value becomes a 200 JSON body,
 * STORY_API_PENDING never settles, and unmatched requests fail (503) so stories stay hermetic.
 */
export function createStoryApiAdapter(routes: readonly StoryApiRoute[]): AxiosAdapter {
  return async (config) => {
    const route = matchStoryApiRoute(routes, config);
    if (!route) {
      console.warn(`[story-api] not mocked: ${config.method?.toUpperCase()} ${requestPath(config)}`);
      const response = { data: { ok: false, error: "not_mocked_in_story" }, status: 503, statusText: "Not mocked", headers: {}, config };
      throw new AxiosError(`Story API: ${config.method?.toUpperCase()} ${requestPath(config)} is not mocked`, "ERR_BAD_RESPONSE", config, null, response as AxiosResponse);
    }
    const data = route.respond(config);
    if (data === STORY_API_PENDING) return never<AxiosResponse>();
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
}

let originalAdapter: InternalAxiosRequestConfig["adapter"] | undefined;
let activeToken: symbol | null = null;

/** Swaps the global axios adapter; returns a token so only the installing scope can restore it. */
export function installStoryApi(routes: readonly StoryApiRoute[]): symbol {
  if (activeToken === null) originalAdapter = axios.defaults.adapter;
  activeToken = Symbol("story-api");
  axios.defaults.adapter = createStoryApiAdapter(routes);
  return activeToken;
}

export function uninstallStoryApi(token: symbol): void {
  if (token !== activeToken) return;
  axios.defaults.adapter = originalAdapter;
  activeToken = null;
}
