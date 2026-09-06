import axios from "axios";

export type LabelDto = {
  id: string;
  name: string;
  color: string;
  shape: string;
  accountId: string;
  createdAt: string;
};

export const labelQueryKeys = {
  all: ["labels"] as const,
  byAccount: (accountId: string) => [...labelQueryKeys.all, "account", accountId] as const,
  pagedByAccount: (accountId: string, pageSize: number) =>
    [...labelQueryKeys.all, "account", accountId, "paged", pageSize] as const,
  manageAccount: ["labels", "manage-account"] as const,
};

type ListLabelsResponse =
  | { ok: true; data: { labels: LabelDto[] } }
  | { ok: false; error: string };

type CreateLabelResponse =
  | { ok: true; data: { label: LabelDto } }
  | { ok: false; error: string };

type SetHaikuLabelsResponse =
  | { ok: true; data: { labels: Array<{ id: string; name: string; color: string; shape: string }> } }
  | { ok: false; error: string };

type ResolveManageAccountResponse =
  | { ok: true; data: { accountId: string } }
  | { ok: false; error: string };

type PagedLabelsResponse =
  | { ok: true; data: { labels: LabelDto[]; total: number; pageSize: number; offset: number } }
  | { ok: false; error: string };

export async function fetchLabelsForAccount(accountId: string): Promise<LabelDto[]> {
  const { data } = await axios.get<ListLabelsResponse>(`/labels/${encodeURIComponent(accountId)}`);
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch labels");
  return data.data.labels;
}

export type CreateLabelForAccountOptions = Omit<LabelDto, "id">;

export async function createLabelForAccount(options: CreateLabelForAccountOptions): Promise<LabelDto> {
  const { accountId, name, color, shape } = options;
  const { data } = await axios.post<CreateLabelResponse>(`/haiku/label/${encodeURIComponent(accountId)}`, {
    name,
    color,
    shape,
  });
  if (!data.ok) throw new Error(data.error ?? "Failed to create label");
  return data.data.label;
}

export async function setLabelsForHaiku(
  haikuId: string,
  labelIds: string[],
): Promise<Array<{ id: string; name: string; color: string; shape: string }>> {
  const { data } = await axios.put<SetHaikuLabelsResponse>(
    `/label/haiku/${encodeURIComponent(haikuId)}`,
    {
      labelIds,
    },
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to update labels");
  return data.data.labels;
}

export async function resolveManageLabelsAccountId(): Promise<string> {
  const { data } = await axios.get<ResolveManageAccountResponse>("/haiku/manage_labels/account");
  if (!data.ok) throw new Error(data.error ?? "Failed to resolve account");
  return data.data.accountId;
}

export async function fetchLabelsForAccountPaged(
  accountId: string,
  params: { pageSize: number; offset: number },
): Promise<{ labels: LabelDto[]; total: number; pageSize: number; offset: number }> {
  const { data } = await axios.get<PagedLabelsResponse>(`/haiku/labels/${encodeURIComponent(accountId)}`, {
    params,
  });
  if (!data.ok) throw new Error(data.error ?? "Failed to fetch paged labels");
  return data.data;
}

export async function updateLabel(options: {
  labelId: string;
  name: string;
  color: string;
  shape: string;
}): Promise<LabelDto> {
  const { data } = await axios.patch<CreateLabelResponse>(
    `/haiku/label/${encodeURIComponent(options.labelId)}`,
    { name: options.name, color: options.color, shape: options.shape },
  );
  if (!data.ok) throw new Error(data.error ?? "Failed to update label");
  return data.data.label;
}

export async function deleteLabel(labelId: string): Promise<void> {
  const { data } = await axios.delete<{ ok: true } | { ok: false; error: string }>(
    `/haiku/label/${encodeURIComponent(labelId)}`,
  );
  if (!data.ok) throw new Error("error" in data ? data.error : "Failed to delete label");
}
