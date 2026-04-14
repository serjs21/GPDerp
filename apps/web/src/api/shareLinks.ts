import axios from "axios";

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
    expirationDate: string | null;
    maxViews: number | null;
  };
};

export type ShareLinkFilter = "active" | "inactive" | "expired" | "view_limit_reached";

export type ShareLinkListItem = {
  id: string;
  shareHash: string;
  shareUrl: string;
  haikuSubject: string;
  createdAt: string;
  expirationDate: string | null;
  maxViews: number | null;
  viewCount: number;
};

export const createShareLink = async (body: CreateShareLinkBody): Promise<CreateShareLinkResponse["data"]> => {
  const { data } = await axios.post<CreateShareLinkResponse>("/share_link", body);
  if (!data.ok) {
    throw new Error("Unexpected response");
  }
  return data.data;
};

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
  filter?: ShareLinkFilter;
  search?: string;
}): Promise<{ items: ShareLinkListItem[]; total: number; pageSize: number; offset: number }> {
  const { data } = await axios.get<ListShareLinksResponse>("/share_links", {
    params: {
      pageSize: params.pageSize,
      offset: params.offset,
      filter: params.filter,
      search: params.search,
    },
  });
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch share links");
  return data.data;
}

type RefreshShareLinkBody = {
  expirationDate?: string | null;
  maxViews?: number | null;
};

type RefreshShareLinkData = {
  id: string;
  shareHash: string;
  shareUrl: string;
  expirationDate: string | null;
  maxViews: number | null;
  viewCount: number;
};

type RefreshShareLinkResponse =
  | { ok: true; data: RefreshShareLinkData }
  | { ok: false; error: string };

export async function refreshShareLink(
  shareLinkId: string,
  body: RefreshShareLinkBody,
): Promise<RefreshShareLinkData> {
  const { data } = await axios.patch<RefreshShareLinkResponse>(
    `/share_link/${encodeURIComponent(shareLinkId)}/refresh`,
    body,
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to refresh share link");
  return data.data;
}

export type ShareHaikuEmailBody = {
  haikuId: string;
  emails: string[];
  message?: string;
};

type ShareHaikuEmailResponse = { ok: true; data: { sentCount: number } } | { ok: false; error: string };

export const shareHaikuByEmail = async (body: ShareHaikuEmailBody): Promise<number> => {
  const { data } = await axios.post<ShareHaikuEmailResponse>("/share_haiku_email", body);
  if (!data.ok) {
    throw new Error(data.error || "Could not send email");
  }
  return data.data.sentCount;
};
