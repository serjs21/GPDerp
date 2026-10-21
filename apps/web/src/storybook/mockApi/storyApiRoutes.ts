import type { InternalAxiosRequestConfig } from "axios";
import type { HaikuDto } from "@/api/haikus";
import type { LabelDto } from "@/api/labels";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { STORY_ACCOUNT_ID } from "../fixtures/haiku";
import { STORY_API_PENDING, type StoryApiMethod, type StoryApiRoute } from "./storyApi";

type PagedOptions = {
  /** Reported total; larger than the items to make the list "have more". */
  total?: number;
  /** First page answers, every later page stays pending (next-page loader). */
  pendingAfterFirstPage?: boolean;
};

const LABELS_PAGED_PATH = /^\/haiku\/labels\/[^/]+$/;

/** Any request to `path` never settles. */
export function pendingRoute(path: StoryApiRoute["path"], method: StoryApiMethod = "get"): StoryApiRoute {
  return { path, method, respond: () => STORY_API_PENDING };
}

/** `{ ok, data: { [listKey]: page, total, pageSize, offset } }`, paged by the request's offset / pageSize. */
function pagedRoute<T>(path: StoryApiRoute["path"], listKey: string, items: readonly T[], options: PagedOptions = {}): StoryApiRoute {
  return {
    path,
    respond: (config: InternalAxiosRequestConfig) => {
      const offset = Number(config.params?.offset ?? 0);
      const pageSize = Number(config.params?.pageSize ?? items.length);
      if (offset > 0 && options.pendingAfterFirstPage) return STORY_API_PENDING;
      const page = options.pendingAfterFirstPage ? items : items.slice(offset, offset + pageSize);
      return { ok: true, data: { [listKey]: page, total: options.total ?? items.length, pageSize, offset } };
    },
  };
}

export const shareLinksRoute = (items: readonly ShareLinkListItem[], options?: PagedOptions) =>
  pagedRoute("/share_links", "items", items, options);

export const labelsPagedRoute = (labels: readonly LabelDto[], options?: PagedOptions) =>
  pagedRoute(LABELS_PAGED_PATH, "labels", labels, options);

export const haikuListRoute = (haikus: readonly HaikuDto[], options?: PagedOptions) =>
  pagedRoute("/haiku", "haikus", haikus, options);

export const pendingLabelsPagedRoute = () => pendingRoute(LABELS_PAGED_PATH);

const LABELS_ALL_PATH = /^\/labels\/[^/]+$/;

/** GET /labels/:accountId (whole catalog, not paged). */
export const labelsRoute = (labels: readonly LabelDto[]): StoryApiRoute => ({
  path: LABELS_ALL_PATH,
  respond: () => ({ ok: true, data: { labels } }),
});

export const pendingLabelsRoute = () => pendingRoute(LABELS_ALL_PATH);

/** GET /haiku: the unfiltered list answers, a search (`q`) stays pending. */
export function haikuSearchPendingRoute(haikus: readonly HaikuDto[]): StoryApiRoute {
  const list = haikuListRoute(haikus);
  return { path: "/haiku", respond: (config) => (config.params?.q ? STORY_API_PENDING : list.respond(config)) };
}

/** POST /haiku/batch: the requested ids found in `haikus`. */
export function haikuBatchRoute(haikus: readonly HaikuDto[]): StoryApiRoute {
  return {
    path: "/haiku/batch",
    method: "post",
    respond: (config) => {
      const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      const ids = new Set<string>(body?.ids ?? []);
      return { ok: true, data: { haikus: haikus.filter((haiku) => ids.has(haiku.id)) } };
    },
  };
}

export const manageLabelsAccountRoute: StoryApiRoute = {
  path: "/haiku/manage_labels/account",
  respond: () => ({ ok: true, data: { accountId: STORY_ACCOUNT_ID } }),
};