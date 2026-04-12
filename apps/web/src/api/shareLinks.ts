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
