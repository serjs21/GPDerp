import axios from "axios";

/** Page size for saved haiku list requests (must match product default). */
export const HAIKU_LIST_PAGE_SIZE = 3;

export type HaikuDto = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: string;
  accountId: string;
  createdById: string;
};

export type HaikuListSuccess = {
  ok: true;
  data: {
    haikus: HaikuDto[];
    total: number;
    pageSize: number;
    offset: number;
  };
};

export type HaikuListErrorBody = { ok: false; error: string };

export type HaikuListResponse = HaikuListSuccess | HaikuListErrorBody;

export type FetchHaikusParams = {
  offset: number;
  pageSize?: number;
  accountId?: string;
};

/**
 * GET /haiku — authenticated; lists haikus across the user’s workspaces (or filtered by accountId).
 */
export async function fetchHaikusPage(params: FetchHaikusParams): Promise<HaikuListSuccess> {
  const { offset, pageSize = HAIKU_LIST_PAGE_SIZE, accountId } = params;
  const { data } = await axios.get<HaikuListResponse>("/haiku", {
    params: {
      offset,
      pageSize,
      ...(accountId !== undefined && accountId !== "" ? { accountId } : {}),
    },
  });

  if (!data.ok) {
    throw new Error(data.error ?? "Failed to load haikus");
  }

  return data;
}

export type DeleteHaikuResponse = { ok: true } | { ok: false; error: string };

export async function deleteHaiku(haikuId: string): Promise<void> {
  const { data } = await axios.delete<DeleteHaikuResponse>(`/haiku/${encodeURIComponent(haikuId)}`);
  if (!data.ok) {
    throw new Error("error" in data ? data.error : "Delete failed");
  }
}

export const haikuQueryKeys = {
  all: ["haikus"] as const,
  infiniteList: (pageSize: number) => [...haikuQueryKeys.all, "infinite", pageSize] as const,
};
