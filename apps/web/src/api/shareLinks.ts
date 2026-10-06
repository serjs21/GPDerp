import axios from "axios";

export type ShareLinkDeactivationReason = "manual" | "timeout" | "limit_reached";

export type CreateShareLinkBody = {
  haikuId: string;
  expirationDate?: string | null;
  maxViews?: number | null;
};

export type CreateShareLinkResponse = {
  ok: true;
  data: {
    id: string;
    shareHash: string;
    shareUrl: string;
    haikuSubject: string;
    sharedHaikuId?: string;
    createdAt: string;
    expirationDate: string | null;
    maxViews: number | null;
    viewCount: number;
    disabled: boolean;
    deactivationReason?: ShareLinkDeactivationReason | null;
    showLabels: boolean;
  };
};

export type ShareLinkFilter = "active" | "inactive" | "expired" | "view_limit_reached";

export const ALL_SHARE_LINK_FILTERS: ShareLinkFilter[] = [
  "active",
  "inactive",
  "expired",
  "view_limit_reached",
];

export type ShareLinkListItem = {
  id: string;
  shareHash: string;
  shareUrl: string;
  haikuSubject: string;
  sharedHaikuId?: string;
  createdAt: string;
  expirationDate: string | null;
  maxViews: number | null;
  viewCount: number;
  disabled: boolean;
  deactivationReason?: ShareLinkDeactivationReason | null;
  /** Show haiku labels on the public share page. */
  showLabels: boolean;
};

/** Client-side OR match mirroring share-link list filters (for optimistic UI). */
export function shareLinkMatchesFilters(
  link: ShareLinkListItem,
  filters: ShareLinkFilter[],
  nowMs: number = Date.now(),
): boolean {
  const unique = ALL_SHARE_LINK_FILTERS.filter((id) => filters.includes(id));
  if (unique.length === 0 || unique.length === ALL_SHARE_LINK_FILTERS.length) return true;

  const expiredByDate =
    link.expirationDate != null && new Date(link.expirationDate).getTime() <= nowMs;
  const viewLimitReached = link.maxViews != null && link.viewCount >= link.maxViews;
  const reason = link.deactivationReason ?? null;

  return unique.some((filter) => {
    switch (filter) {
      case "active":
        return !link.disabled && !expiredByDate && !viewLimitReached;
      case "inactive":
        return link.disabled && (reason === null || reason === "manual");
      case "expired":
        return expiredByDate || reason === "timeout";
      case "view_limit_reached":
        return viewLimitReached || reason === "limit_reached";
      default:
        return false;
    }
  });
}

export const createShareLink = async (body: CreateShareLinkBody): Promise<CreateShareLinkResponse["data"]> => {
  const { data } = await axios.post<CreateShareLinkResponse>("/share_link", body);
  if (!data.ok) {
    throw new Error("Unexpected response");
  }
  return data.data;
};

type FetchShareLinkForHaikuResponse =
  | { ok: true; data: ShareLinkListItem | null }
  | { ok: false; error: string };

export async function fetchShareLinkForHaiku(haikuId: string): Promise<ShareLinkListItem | null> {
  const { data } = await axios.get<FetchShareLinkForHaikuResponse>(
    `/share_link/haiku/${encodeURIComponent(haikuId)}`,
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch share link");
  return data.data;
}

export const deleteShareLink = async (shareLinkId: string): Promise<void> => {
  const { data } = await axios.delete<{ ok: boolean; error?: string }>(
    `/share_link/${encodeURIComponent(shareLinkId)}`,
  );
  if (!data.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Delete failed");
  }
};

type ListShareLinksResponse =
  | {
      ok: true;
      data: { items: ShareLinkListItem[]; total: number; pageSize: number; offset: number };
    }
  | { ok: false; error: string };

export async function fetchShareLinksPaged(params: {
  pageSize: number;
  offset: number;
  /** Multi-select OR filters. Omit / empty / all four → unfiltered. */
  filters?: ShareLinkFilter[];
  /** @deprecated use `filters` */
  filter?: ShareLinkFilter;
  search?: string;
  /** Sort category id from ShareLinksSort (creationDate / alpacabeth / hitsLeft / timeLeft). */
  sort?: string;
  /** Sort direction; ignored when `sort` is omitted. */
  dir?: "asc" | "desc";
}): Promise<{ items: ShareLinkListItem[]; total: number; pageSize: number; offset: number }> {
  const filters =
    params.filters ?? (params.filter ? [params.filter] : undefined);
  const unique = filters
    ? ALL_SHARE_LINK_FILTERS.filter((id) => filters.includes(id))
    : [];
  const filterParam =
    unique.length === 0 || unique.length === ALL_SHARE_LINK_FILTERS.length
      ? undefined
      : unique.join(",");

  const { data } = await axios.get<ListShareLinksResponse>("/share_links", {
    params: {
      pageSize: params.pageSize,
      offset: params.offset,
      filter: filterParam,
      search: params.search,
      sort: params.sort,
      dir: params.dir,
    },
  });
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch share links");
  return data.data;
}

type RefreshShareLinkBody = {
  expirationDate?: string | null;
  maxViews?: number | null;
};

type RefreshShareLinkResponse =
  | { ok: true; data: ShareLinkListItem }
  | { ok: false; error: string };

export async function refreshShareLink(
  shareLinkId: string,
  body: RefreshShareLinkBody,
): Promise<ShareLinkListItem> {
  const { data } = await axios.patch<RefreshShareLinkResponse>(
    `/share_link/${encodeURIComponent(shareLinkId)}/refresh`,
    body,
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to refresh share link");
  return data.data;
}

type SetShareLinkStatusResponse =
  | { ok: true; data: ShareLinkListItem }
  | { ok: false; error: string };

export async function setShareLinkDisabled(
  shareLinkId: string,
  disabled: boolean,
): Promise<ShareLinkListItem> {
  const { data } = await axios.patch<SetShareLinkStatusResponse>(
    `/share_link/${encodeURIComponent(shareLinkId)}/status`,
    { disabled },
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to update share link status");
  return data.data;
}

export async function setShareLinkShowLabels(
  shareLinkId: string,
  showLabels: boolean,
): Promise<ShareLinkListItem> {
  const { data } = await axios.patch<SetShareLinkStatusResponse>(
    `/share_link/${encodeURIComponent(shareLinkId)}/settings`,
    { showLabels },
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to update share link settings");
  return data.data;
}

export type ShareHaikuEmailBody = {
  haikuId: string;
  emails: string[];
  message?: string;
  /**
   * Shared front + one back per recipient. When present the request is sent as multipart
   * form data and `emails` is taken from the backs so the two lists stay aligned.
   */
  postcard?: { front: Blob; backs: Array<{ recipient: string; blob: Blob }> };
};

type ShareHaikuEmailResponse = { ok: true; data: { sentCount: number } } | { ok: false; error: string };

const buildShareHaikuEmailFormData = (
  body: Omit<ShareHaikuEmailBody, "emails"> & { postcard: NonNullable<ShareHaikuEmailBody["postcard"]> },
): FormData => {
  const form = new FormData();
  form.append("haikuId", body.haikuId);
  form.append("emails", JSON.stringify(body.postcard.backs.map((back) => back.recipient)));
  form.append("message", body.message ?? "");
  form.append("postcardFront", body.postcard.front, "postcard-front.png");
  body.postcard.backs.forEach((back, index) => {
    form.append("postcardBack", back.blob, `postcard-back-${index + 1}.png`);
  });
  return form;
};

export const shareHaikuByEmail = async ({ postcard, ...json }: ShareHaikuEmailBody): Promise<number> => {
  const { data } = postcard
    ? await axios.post<ShareHaikuEmailResponse>(
        "/share_haiku_email",
        buildShareHaikuEmailFormData({ ...json, postcard }),
        // Overrides the global JSON content type; the browser sets the multipart boundary.
        { headers: { "Content-Type": "multipart/form-data" } },
      )
    : await axios.post<ShareHaikuEmailResponse>("/share_haiku_email", json);
  if (!data.ok) {
    throw new Error(data.error || "Could not send email");
  }
  return data.data.sentCount;
};
